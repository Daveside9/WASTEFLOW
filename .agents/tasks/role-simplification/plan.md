# Implementation Plan — Aquasource Hub 3-Role Simplification

Repo: `c:\Users\THIS PC\Desktop\aquasoursehub` (React + TS + Vite + Tailwind; no backend, no test runner).
Build/verify: `npm run build` (`tsc -b && vite build`) must exit 0. Typecheck-only: `npx tsc -b --force`.

Baseline note (verified): `npm run build` currently FAILS with 31 pre-existing TS errors, ALL in files this task modifies (`DashboardShell.tsx`, `AuthContext.tsx`, `OverviewPage.tsx`, `WasteMarketPage.tsx`, `RegisterPage.tsx`). Root causes: (a) icon-typed fields use `React.FC<{size?:number;strokeWidth?:number;className?:string}>`, incompatible with Lucide's `ForwardRefExoticComponent` (its `size` is `string|number`) → fix by typing those fields as `LucideIcon` from `lucide-react`; (b) unused locals/params/imports (AuthContext `register` `data`, RegisterPage `navigate`, RegisterPage `RegisterPayload`). Every rewritten file must compile clean so the Definition-of-Done "build passes" is met.

Role mapping: `reporter` + `waste_sourcer` → `seller`; `hub_operator` → `weigher`; `recycler` → `buyer`; `admin` removed (no 4th role). Marketplace flow: Seller lists → Weigher verifies → Buyer purchases.
Decision: keep the `sourcerId` / `sourcerName` / `sourcerRegion` data-model field names in TradingContext and consumers (they denote the listing Seller; they are NOT old role identifiers and not grep targets) — only update the `SOURCER:` code comments to `SELLER:`.

The work is split into 2 sequential features (FEAT-001 = roles + dashboards, FEAT-002 = signup verification). Steps below are grouped by feature.

---

## FEAT-001 — Replace 5-role system with 3-role model + role-specific dashboards

- [ ] 1. AuthContext: define the 3-role type and rename the recycler profile.
      `src/context/AuthContext.tsx` — change `export type UserRole` to `| 'seller' | 'buyer' | 'weigher'`; rename `interface RecyclerProfile` → `BuyerProfile`; in `User` rename field `recyclerProfile?: RecyclerProfile` → `buyerProfile?: BuyerProfile` and rewrite the `approved` comment (drop `hub_operator / admin / waste_sourcer need approval`); in `RegisterPayload` rename `recyclerProfile?` → `buyerProfile?`; in simulated `login()` set demo user `role: 'reporter'` → `'seller'`; in `register` rename the unused implementation param `data` → `_data` (keeps the `(data: RegisterPayload)` interface, silences TS6133); update the `role === 'recycler'` comment to `'buyer'`.
      Verify: `npx tsc -b --force` — no errors originating from AuthContext.

- [ ] 2. Icon mapper: add the Weigher icon.
      `src/components/ui/Icon.tsx` — add `Scale` to the `lucide-react` import list and to the `icons` map. Used by landingData's Weigher role (string ref).
      Verify: `npm run build` — compiles; `Scale` resolves in Icon map.

- [ ] 3. Landing data: 3 roles + marketplace-flow copy (remove old role names).
      `src/data/landingData.ts` — (a) replace `roles` (6 entries) with exactly 3: Seller (`Package`), Buyer (`Recycle`), Weigher (`Scale`) with descriptions; (b) rewrite `journeySteps` (7 steps) to List → Assess → Verify → Purchase → Reward → Reuse → Impact using only icon names that exist in Icon.tsx (MessageSquarePlus, ScanSearch, Scale, Store, Coins, Leaf, BarChart3) and copy free of `reporter`/`collector`/`operator`/`coordinator`; (c) update `features` entries that name old roles — "Verified Collection Records" desc → "weighed and confirmed by a Weigher…", "Blue Credits Ledger" desc → "from Weigher-verified weight using transparent, configured rules"; (d) update `circularItems[0]` "Plastic Recovery" desc: "through hub verification" → "through Weigher verification". Leave `impactStats` and the `other`/Unsure waste concept untouched.
      Verify: `grep` landingData for `collector|operator|reporter|coordinator|Hub Operator|Community Reporter|Waste Sourcer` → no hits.

- [ ] 4. RolesSection: grid for 3 cards.
      `src/components/sections/RolesSection.tsx` — change the grid `xl:grid-cols-6` → `xl:grid-cols-3` (keep `sm:grid-cols-2 lg:grid-cols-3`). Section consumes `roles` from landingData — no other change.
      Verify: landing page renders 3 role cards (manual).

- [ ] 5. Hero copy: remove "cleanup collectors".
      `src/components/sections/HeroSection.tsx` — change "connects coastal communities, cleanup collectors, and recyclers …" → "connects coastal communities, sellers, weighers, and buyers …".
      Verify: grep `collectors` in HeroSection → no hit.

- [ ] 6. Features subtitle: remove coordinators/hub operators.
      `src/components/sections/FeaturesSection.tsx` — change "Built for coastal communities, coordinators, hub operators, and recyclers —" → "Built for coastal communities, sellers, weighers, and buyers —".
      Verify: grep `coordinators|hub operators` in FeaturesSection → no hit.

- [ ] 7. Journey heading: Report → Listing.
      `src/components/sections/JourneySection.tsx` — change heading "From Report to Reuse — Every Step Verified" → "From Listing to Reuse — Every Step Verified". Section consumes `journeySteps` from landingData.
      Verify: heading string updated; builds.

- [ ] 8. AuthCTA copy + feature lists.
      `src/components/sections/AuthCTASection.tsx` — update `signInFeatures` and `registerFeatures` arrays to marketplace wording (see FEAT-001 step 8); change the heading line ending "privileged access is reviewed by administrators." → "every account is verified before it is activated."; change the Register card paragraph "Join as a reporter, collector, hub operator, coordinator, or recycler. Free to join." → "Join as a Seller, Buyer, or Weigher. Free to join."
      Verify: grep `reporter|collector|operator|recycler|administrator` in AuthCTASection → no hits as role identifiers.

- [ ] 9. DashboardShell: 3-role nav + labels + icon type fix.
      `src/components/dashboard/DashboardShell.tsx` — replace `ROLE_LABELS` with `{ seller:'Seller', buyer:'Buyer', weigher:'Weigher' }`; change `NavItem.icon` type to `LucideIcon` (import `LucideIcon` from `lucide-react`; add `Scale` import; remove now-unused `Map, ClipboardList, BarChart3` imports); replace `getNavItems` with 3 cases (seller→[base, listings, credits, settings]; buyer→[base, market, credits, settings]; weigher→[base, verify, credits, settings]; default→[base, market, settings], each case returns); change fallback `getNavItems(user?.role ?? 'reporter')` → `?? 'seller'`. `base`/`credits`/`settings`/`listings`/`market`/`verify` are local NavItems.
      Verify: `npm run build` — DashboardShell's 9 prior TS2322 errors gone.

- [ ] 10. TradingContext: add Weigher verification to the trade flow.
       `src/context/TradingContext.tsx` — add `'verified'` to `ListingStatus`; add `'weight_verified'` to `TradeEventType`; add optional fields to `WasteListing` (`verifiedWeight?`, `verifiedTotal?`, `weigherId?`, `weigherName?`, `verifiedAt?`); add `verifyListing(id, weigherId, weigherName, verifiedWeight)` to the interface and provider value; implement it (set verifiedWeight/verifiedTotal=verifiedWeight*pricePerKg/weigherId/weigherName/verifiedAt, status='verified', push `weight_verified` timeline event, addNotification '✅ Material Verified'). Keep existing `confirmInspection` buyer action unchanged (buyer confirms at pickup). Update `SOURCER:` comments → `SELLER:`; keep `sourcerId/sourcerName/sourcerRegion` field names.
       Verify: `npm run build` — TradingContext compiles; `verifyListing` is exported via `useTrading()`.

- [ ] 11. Create shared CreateListingModal (extract).
       `src/components/dashboard/CreateListingModal.tsx` (NEW) — move the existing `CreateListingModal` out of WasteMarketPage unchanged (props `{ onClose }`, uses `useAuth().user` + `useTrading().createListing`, same fields/validation/payload). Default export.
       Verify: builds; WasteMarketPage and SellerDashboard can both import it.

- [ ] 12. Create shared VerifyListingModal (new).
       `src/components/dashboard/VerifyListingModal.tsx` (NEW) — props `{ listing: WasteListing; onClose }`; uses `verifyListing` + `useAuth().user`; numeric "Verified weight (kg)" input (default `estimatedWeight`), live verified-total preview, "Confirm Verification" calls `verifyListing(listing.id, user.id, user.fullName, +w)` then `onClose()`; validate weight > 0; match the dark glass style (bg `#0B2233`, teal accents, `XCircle` close).
       Verify: builds; WeigherDashboard renders it and a verify call moves a listing to `verified`.

- [ ] 13. SellerDashboard (new).
       `src/pages/dashboard/SellerDashboard.tsx` (NEW) — wrapped in `<DashboardShell title="Overview" subtitle={greeting}>`; local `StatCard` with `icon: LucideIcon`; 4 stats (My Listings, Active Trades, Completed, Blue Credits) computed from `listings.filter(l=>l.sourcerId===user.id)`; earnings banner when totalEarned>0; "My Recent Listings" with a "Post Waste" button that opens `<CreateListingModal>` and rows that navigate to `/dashboard/market`. Icons: Package, Clock, CheckCircle2, Coins, TrendingUp, ArrowRight, Plus.
       Verify: builds; Seller role (demo login) shows listings + credits + Post Waste.

- [ ] 14. BuyerDashboard (new).
       `src/pages/dashboard/BuyerDashboard.tsx` (NEW) — DashboardShell("Overview", greeting); 4 stats (Available Waste [status 'available' OR 'verified'], Active Trades, Completed Buys, Total Spent) from `myPurchases=listings.filter(l=>l.buyerId===user.id)`; "Available Now" list (verified + available) rows navigate to `/dashboard/market`; "Browse all" link. Icons: Package, Clock, CheckCircle2, Coins, ArrowRight.
       Verify: builds; Buyer role shows browse + purchase stats.

- [ ] 15. WeigherDashboard (new).
       `src/pages/dashboard/WeigherDashboard.tsx` (NEW) — DashboardShell("Overview", greeting); 4 stats (Pending Verification [status 'available'], Verified by Me [weigherId===user.id], Total Verified Weight, Verified Value); "Verification Queue" of available listings, each with a "Verify" button opening `<VerifyListingModal listing={l}>`; empty-state when none. Icons: Package, Scale, CheckCircle2, Coins.
       Verify: builds; Weigher role shows a verification queue and can verify a listing → it becomes 'verified'.

- [ ] 16. OverviewPage: refactor into a role router.
       `src/pages/dashboard/OverviewPage.tsx` — replace the body with a thin `switch (user?.role)`: `seller`→`<SellerDashboard/>`, `buyer`→`<BuyerDashboard/>`, `weigher`→`<WeigherDashboard/>`, default→`<SellerDashboard/>`. Remove the old `StatCard`/`isSourcer`/`isRecycler`/inline-stats and all now-unused imports (Package, Coins, CheckCircle2, Clock, ArrowRight, TrendingUp, useTrading, useNavigate). Keep only `useAuth` + the 3 dashboard imports. (Each dashboard renders its own DashboardShell, so OverviewPage no longer does.)
       Verify: `npm run build` — OverviewPage's prior TS2322 errors gone; `/dashboard` renders the role's dashboard.

- [ ] 17. WasteMarketPage: role ids + Weigher verify action + verified status + icon type.
       `src/pages/dashboard/WasteMarketPage.tsx` — (a) `isSourcer`→`isSeller` (`role==='seller'`), `isRecycler`→`isBuyer` (`role==='buyer'`), add `isWeigher` (`role==='weigher'`); (b) type `WASTE_ICONS` value as `LucideIcon`; (c) add `verified` to `STATUS_COLORS` (teal-strong) and `STATUS_LABELS` ('Verified'); (d) replace the in-file `CreateListingModal` with an import from `@/components/dashboard/CreateListingModal` (delete the local definition); (e) in `ListingDetailModal`: rename `isSourcer`→`isSeller`, `isRecycler`→`isBuyer`, add `isWeigher`; add a Weigher action when `isWeigher && listing.status==='available'` that opens the `VerifyListingModal` (or an inline verify step using `verifyListing`); allow buyer "Express Interest" when `['available','verified'].includes(listing.status)`; (f) main page: "Post Waste" button when `isSeller`, weigher subtitle "Verify and value incoming waste" when `isWeigher`, keep the buyer banner; update empty-state copy branches to `isSeller`/`isBuyer`. Keep `WasteType`/`WASTE_LABELS`/`WASTE_ICONS` and the `other` category unchanged.
       Verify: `npm run build` — WasteMarketPage's prior TS2322 errors gone; weigher sees Verify; buyer can express interest on verified.

- [ ] 18. RegisterPage: 3 role options + BuyerProfile + remove approval gating (verification added by FEAT-002).
       `src/pages/RegisterPage.tsx` — (a) replace `roleOptions` with exactly 3 (Seller/Package, Buyer/Recycle, Weigher/Scale); type `RoleOption.Icon` as `LucideIcon` (add Package, Scale imports + `LucideIcon`); (b) `isRecycler`→`isBuyer`, company-fields guard `{isBuyer && ...}`, rename local `recyclerProfile`→`buyerProfile` (`: BuyerProfile | undefined`), `register({ buyerProfile })`; update type import `RecyclerProfile`→`BuyerProfile`; (c) delete `RESTRICTED` and both blocks using it (success-screen approval block + in-form restricted-notice block); (d) fix unused-symbol errors: drop `useNavigate` import + the `const navigate` line; build `const payload: RegisterPayload = {...}` and `await register(payload)` (uses the `RegisterPayload` import); (e) update "Recycler company fields" comment → "Buyer company fields". Keep password-strength, terms, and validation logic.
       Verify: `npm run build` — RegisterPage's prior TS2322/TS6133/TS6196 errors gone; /register shows exactly 3 roles.

- [ ] 19. ProtectedRoute & App: confirm (no change).
       `src/components/auth/ProtectedRoute.tsx`, `src/App.tsx` — no code change; ProtectedRoute compares `requiredRole.includes(user.role)` with string ids (works with seller/buyer/weigher), App routes `/dashboard`→OverviewPage (now role-routing internally) and `/dashboard/market`→WasteMarketPage. Re-confirm they typecheck after the `UserRole` change.
       Verify: `npm run build` — both compile unchanged.

- [ ] 20. FEAT-001 full verification.
       Run `npm run build` (exit 0, no TS errors); run the grep check across `src` for `reporter`, `collector`, `operator`, `waste_sourcer`, `hub_operator`, `admin`, `recycler`, `Community Reporter`, `Waste Collector`, `Hub Operator`, `Administrator`, `Coordinator` → no hits as role identifiers (kept `sourcer*` data fields allowed; any open-point comment note allowed). Manual `npm run dev`: /register shows 3 roles; landing RolesSection shows 3 roles; /dashboard routes the demo Seller to SellerDashboard.
       Verify: as above.

## FEAT-002 — Signup verification step (Part 3)

- [ ] 21. RegisterPage: add verification step to the signup flow.
       `src/pages/RegisterPage.tsx` — add `step: 'details' | 'verify'` (default 'details'), `code` (string), `enteredCode` (string) state. In `handleSubmit` (details submit), after validation passes: generate `const generated = (100000 + Math.floor(Math.random()*900000)).toString()`, `setCode(generated)`, `setEnteredCode('')`, `setStep('verify')` — do NOT call `register` yet. Wrap the existing details form in `step === 'details' && (...)`. Keep all existing form state, role options, company fields (isBuyer), and password-strength logic intact.
       Verify: builds; submitting the details form advances to the verify step.

- [ ] 22. RegisterPage: verification step UI.
       `src/pages/RegisterPage.tsx` — render when `step === 'verify'`: heading "Verify your account"; paragraph "We sent a 6-digit verification code to {form.email}. Enter it below to activate your account."; a demo info banner (teal/amber, matching existing banner patterns) "Demo mode: your verification code is **{code}**"; a numeric code input (`AuthInput` type text inputMode numeric maxLength 6, or a styled input); an error slot; a primary "Verify & Create Account" button (teal, same styling as submit) calling `handleVerify`; a "Resend code" text button (regenerates code, resets `enteredCode`); a "Back" button → `setStep('details')`. Do not re-show the terms checkbox (already accepted).
       Verify: builds; verify step shows the generated code and a code input.

- [ ] 23. RegisterPage: handleVerify + success copy.
       `src/pages/RegisterPage.tsx` — `handleVerify`: if `enteredCode.trim() === code` then setLoading(true), build `payload: RegisterPayload` (same shape as FEAT-001), `await register(payload)`, `setSuccess(true)` (try/catch/finally, error via `authError`, Loader2 spinner while loading). On mismatch set a local verify error "Incorrect code. Please try again." Update the success screen to reflect verification: heading "Account Verified!", body "Your account is verified and active. You can now sign in." (keep the "Go to Sign In" Link; remove any admin-review wording). Ensure no unused imports/vars; no new dependency; the code lives only in component state (not persisted).
       Verify: `npm run build` exits 0; manual: wrong code → error; correct code → "Account Verified!" screen.

- [ ] 24. FEAT-002 full verification.
       `npm run build` exits 0 with no TS errors. Manual `npm run dev`: /register → fill form, pick role, submit → verify step shows a 6-digit code; wrong code → error; correct code → "Account Verified!" success screen. Confirm verification is part of signup (same flow), not post-login, and the account is not active until verified.
       Verify: as above.

---

## Digest (per file — block to change, test that covers it, what was verified)

- `src/context/AuthContext.tsx` — `UserRole` union (L6-10), `RecyclerProfile` iface (L12-19), `User.approved`/`recyclerProfile` (L25-29), `RegisterPayload.recyclerProfile` (L52), simulated login `role:'reporter'` (L111), `register(data)` unused param (L131). Test: `npm run build`. Verified today: baseline `tsc -b --force` reports TS6133 'data' unused here; rest of file typechecks except where consumed by broken icon types downstream.
- `src/context/TradingContext.tsx` — `ListingStatus` (L8-14), `TradeEventType` (L16-26), `WasteListing` (L36-56), `TradingContextValue` action list (L70-86), `confirmPaymentReceived` (L240+). Add `verifyListing`. Test: `npm run build`. Verified today: file typechecks clean (no baseline errors here).
- `src/data/landingData.ts` — `journeySteps` (L11-19), `features` (L23-48), `circularItems` (L52-75), `roles` (L77-83). Test: grep + build. Verified today: contains all old role display names + "collector"/"operator"/"hub operator" copy.
- `src/components/ui/Icon.tsx` — import list + `icons` map (whole file). Add `Scale`. Test: build. Verified today: maps the listed names; `Scale` not yet present.
- `src/components/sections/RolesSection.tsx` — grid className `... xl:grid-cols-6 ...` (L59). Consume `roles`. Test: build + manual. Verified today: maps `roles` from landingData.
- `src/components/sections/HeroSection.tsx` — hero paragraph "…cleanup collectors, and recyclers…" (L113). Test: grep. Verified today: contains "collectors".
- `src/components/sections/FeaturesSection.tsx` — subtitle "Built for coastal communities, coordinators, hub operators, and recyclers —" (L56). Test: grep. Verified today: contains "coordinators"/"hub operators".
- `src/components/sections/JourneySection.tsx` — heading "From Report to Reuse — Every Step Verified". Consume `journeySteps`. Test: build. Verified today: maps journeySteps.
- `src/components/sections/AuthCTASection.tsx` — `signInFeatures` (L6-11), `registerFeatures` (L13-18), heading paragraph "…reviewed by administrators." (L58), Register card paragraph "Join as a reporter, collector, hub operator, coordinator, or recycler…" (L120). Test: grep. Verified today: contains old role list + "administrators".
- `src/components/dashboard/DashboardShell.tsx` — `ROLE_LABELS` (L13-20), `NavItem` iface icon type (L22), `getNavItems` switch (L36-45), fallback `getNavItems(user?.role ?? 'reporter')` (L59), lucide import line (L4-6). Test: `npm run build`. Verified today: baseline reports 9× TS2322 here (icon type).
- `src/pages/dashboard/OverviewPage.tsx` — `StatCard` icon type (L10-22), `isSourcer`/`isRecycler` branches (L30-180). Refactor to role router. Test: `npm run build`. Verified today: baseline reports 8× TS2322 here.
- `src/pages/dashboard/WasteMarketPage.tsx` — `WASTE_ICONS` Record type (L23-29), `ListingDetailModal` role checks (L~ isSourcer/isRecycler/isRecycler express-interest guard), main page `isSourcer`/`isRecycler` (L near end), in-file `CreateListingModal` (L ~80-170). Test: `npm run build`. Verified today: baseline reports 5× TS2322 here.
- `src/pages/RegisterPage.tsx` — `roleOptions` (L22-53, incl. icon types L27/33/39/45/51), `RESTRICTED` (L55), `isRecycler` (L107), company-fields guard (L346), `recyclerProfile` (L138), `useNavigate`/`navigate` (L5/L95), type import (L10), success screen (L160-200), restricted-notice block (L336-343). Test: `npm run build`. Verified today: baseline reports 8 errors here (4× TS2322 icon, TS6133 navigate, TS6196 unused import).
- `src/pages/dashboard/SellerDashboard.tsx` (NEW), `src/pages/dashboard/BuyerDashboard.tsx` (NEW), `src/pages/dashboard/WeigherDashboard.tsx` (NEW), `src/components/dashboard/CreateListingModal.tsx` (NEW), `src/components/dashboard/VerifyListingModal.tsx` (NEW) — pattern on OverviewPage/WasteMarketPage styling. Test: `npm run build` + manual role routing.
- `src/components/auth/ProtectedRoute.tsx`, `src/App.tsx` — no change; re-confirm typecheck. Verified today: no baseline errors; role-generic.

Open points (flagged, not decided): No admin-only business logic (reward rule management, suspicious submission review, report exports) is implemented in the codebase — `admin` appears only as a role option/label/nav item, which is removed by the 3-role model. The `BLUE_CREDIT_RATE` constant (5 credits/kg) in TradingContext is a configured rule but not admin-gated; it is kept intact. If admin-only logic is introduced later, it has no home role in the 3-role model and is a product decision. No code was left as-is-with-comment because no such logic exists. (The "Unsure"/`other` waste category and all non-role features are preserved unchanged.)
