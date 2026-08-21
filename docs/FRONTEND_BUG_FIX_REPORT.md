# Frontend Bug-Fix Report

This document records all frontend functional bugs identified and fixed during the Bug-Fix Phase on the `fix/frontend-validation` branch.

| Bug ID | Page | Action | Expected Result | Actual Result | Cause | Status |
|--------|------|--------|-----------------|---------------|-------|--------|
| BUG-001 | Medicine Request | Click "Send Request for Quotations" | Request proceeds | Validation error | Frontend payload mismatched backend Zod schema (`pharmacyIds` vs `selectedPharmacyIds`, missing `customerLocation`) | FIXED |
| BUG-002 | Global | Click any loading Button | Button shows loading spinner | Button does not show loading spinner | Button component expects `isLoading` prop but many frontend files passed `loading` prop during UI redesign | FIXED |
| BUG-003 | Orders/Quotations | View Order/Quotation Total | Display total in Rs | Calculation error, total divides by 100 | The frontend was dividing by 100, but the backend `quotation.controller.js` and `order.controller.js` already format cents to dollars | FIXED |
| BUG-004 | Order Success / Selection | View Order Status | Correctly displays order amount | Total amount is `undefined` | The frontend used `order.totalAmount` but the backend returned `order.total` | FIXED |
| BUG-005 | Pharmacy Inbox | View Inbox / My Requests | Request list loads | API returns 404 Not Found | Frontend `requestService` used `/requests/pharmacy` instead of `/pharmacies/me/requests` | FIXED |
| BUG-006 | Customer Requests | View My Requests | Request list loads | API returns 404 Not Found | Frontend `requestService` used `/requests/customer` instead of `/requests` | FIXED |
| BUG-007 | Pharmacy Quote | Submit Quotation | Quotation gets submitted | API returns 403 Forbidden | Frontend hit `/requests/:id/quotations` instead of `/pharmacies/me/requests/:id/quote`, and backend `authorize('pharmacy')` had wrong casing (needs 'PHARMACY') | FIXED |
| BUG-008 | Dashboards | View Dashboards | Amounts show correctly in Rs | Amount displays as raw cents without decimals | `customerDashboard.service.js` and `pharmacyDashboard.service.js` were returning raw MongoDB values (in cents) without formatting | FIXED |
