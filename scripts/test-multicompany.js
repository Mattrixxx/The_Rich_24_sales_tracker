/**
 * Smoke test for multi-company isolation (run against dev server).
 * Usage: node scripts/test-multicompany.js [baseUrl] [username] [password]
 */

const BASE = process.argv[2] || "http://localhost:3000"
const USERNAME = process.argv[3] || "mingth.forwork@gmail.com"
const PASSWORD = process.argv[4] || "0831921170za"

let cookies = {}

function cookieHeader() {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ")
}

function storeCookies(res) {
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  for (const c of setCookies) {
    const [pair] = c.split(";")
    const idx = pair.indexOf("=")
    const name = pair.slice(0, idx).trim()
    const value = pair.slice(idx + 1).trim()
    if (value) cookies[name] = value
    else delete cookies[name]
  }
}

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader(),
      ...(opts.headers || {}),
    },
    redirect: "manual",
  })
  storeCookies(res)
  return res
}

let passed = 0
let failed = 0
function check(name, cond, extra = "") {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✗ ${name} ${extra}`)
  }
}

async function login() {
  const csrfRes = await req("/api/auth/csrf")
  const { csrfToken } = await csrfRes.json()
  const res = await req("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken,
      username: USERNAME,
      password: PASSWORD,
      json: "true",
    }),
  })
  const ok = Object.keys(cookies).some((k) => k.includes("session-token"))
  check("login as admin", ok, `(status ${res.status})`)
  return ok
}

async function main() {
  console.log(`Testing against ${BASE}\n`)

  if (!(await login())) {
    console.log("Cannot continue without login")
    process.exit(1)
  }

  // 1. List companies
  let res = await req("/api/companies")
  let data = await res.json()
  check("GET /api/companies returns companies", res.ok && Array.isArray(data.companies))
  const rich24 = data.companies.find((c) => c.name === "The Rich 24")
  check("The Rich 24 exists", !!rich24)
  check("currentId defaults to The Rich 24", data.currentId === rich24?.id)

  // 2. Company 1 has data
  res = await req("/api/products")
  const productsC1 = await res.json()
  check("company 1 has products", res.ok && productsC1.length > 0, `(${productsC1.length})`)
  const c1Product = productsC1[0]

  res = await req("/api/employees")
  const employeesC1 = await res.json()
  check("company 1 has employees", res.ok && employeesC1.length > 0)
  const c1Employee = employeesC1[0]

  // 3. Create test child company
  res = await req("/api/companies", {
    method: "POST",
    body: JSON.stringify({ name: "__TEST_CHILD__" }),
  })
  let child = await res.json()
  if (res.status === 400) {
    // already exists from a previous run — find it
    const list = await (await req("/api/companies")).json()
    child = list.companies.find((c) => c.name === "__TEST_CHILD__")
  }
  check("create child company", !!child?.id)

  // 4. Switch to child company
  res = await req("/api/company/switch", {
    method: "POST",
    body: JSON.stringify({ companyId: child.id }),
  })
  check("switch to child company", res.ok)

  // 5. Child company data is empty
  res = await req("/api/products")
  data = await res.json()
  check("child company products empty", res.ok && data.length === 0, `(${data.length})`)

  res = await req("/api/orders")
  data = await res.json()
  check("child company orders empty", res.ok && data.total === 0, `(total ${data.total})`)

  res = await req("/api/dashboard")
  data = await res.json()
  check("child company dashboard zeros", res.ok && data.totalOrders === 0 && data.totalRevenue === 0 && data.totalProducts === 0)

  // 6. Cross-company reference attack: create order in child company using company-1 product/employee
  res = await req("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      employeeId: c1Employee.id,
      platformId: 1,
      totalPrice: 100,
      items: [{ productId: c1Product.id, quantity: 1 }],
    }),
  })
  check("cross-company order creation rejected", res.status === 400, `(status ${res.status})`)

  // 7. Cross-company [id] access: delete company-1 product while in child company
  res = await req(`/api/products/${c1Product.id}`, { method: "DELETE" })
  check("cross-company product delete returns 404", res.status === 404, `(status ${res.status})`)

  // 8. Cross-company stock-in rejected
  res = await req("/api/stock-in", {
    method: "POST",
    body: JSON.stringify({ productId: c1Product.id, quantity: 5, costPerUnit: 10 }),
  })
  check("cross-company stock-in rejected", res.status === 400, `(status ${res.status})`)

  // 9. Platform with same name in both companies
  res = await req("/api/platforms", {
    method: "POST",
    body: JSON.stringify({ name: "Shopee" }),
  })
  const childPlatform = await res.json()
  check("child company can create platform 'Shopee'", res.ok, `(status ${res.status})`)

  // 10. Switch back to The Rich 24 — data intact
  res = await req("/api/company/switch", {
    method: "POST",
    body: JSON.stringify({ companyId: rich24.id }),
  })
  check("switch back to The Rich 24", res.ok)

  res = await req("/api/products")
  data = await res.json()
  check("company 1 products intact", res.ok && data.length === productsC1.length)

  res = await req("/api/dashboard")
  data = await res.json()
  check("company 1 dashboard has data", res.ok && data.totalOrders > 0, `(orders ${data.totalOrders})`)

  // 11. Tampered cookie: switch to non-existent company → fallback works
  cookies["company_id"] = "99999"
  res = await req("/api/products")
  data = await res.json()
  check("invalid company cookie falls back safely", res.ok && data.length === productsC1.length)
  delete cookies["company_id"]

  // Cleanup: delete test platform then test company
  await req("/api/company/switch", { method: "POST", body: JSON.stringify({ companyId: child.id }) })
  if (childPlatform?.id) {
    await req(`/api/platforms/${childPlatform.id}`, { method: "DELETE" })
  }
  await req("/api/company/switch", { method: "POST", body: JSON.stringify({ companyId: rich24.id }) })
  res = await req(`/api/companies/${child.id}`, { method: "DELETE" })
  check("cleanup: delete empty test company", res.ok, `(status ${res.status})`)

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
