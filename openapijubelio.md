# Jubelio API Reference - Complete Agent Knowledge Base

## Overview

- **Title**: Jubelio API Reference
- **Version**: 1.0
- **License**: Apache 2.0
- **Base URL**: https://api2.jubelio.com
- **Total API Endpoints**: 287 across 254 paths
- **Total Schemas**: 282
- **Total Tags/Categories**: 25

---

## General Information

### Getting Started

Jubelio helps simplify business by integrating back office, warehouse, marketplace, webstore and POS into one dashboard. The API is REST-based.

**Registration:**
- Existing Jubelio Omnichannel users: Log in at https://app2.jubelio.com (complete migration first)
- New users: Register at https://app2.jubelio.com

### Authentication

- Generate access token via `POST /login`
- Token expires after **12 hours**
- Use token in request's `Authorization` header
- On expiry, re-authenticate with `POST /login`

### API Rate Limit

- **600 requests per minute**
- Exceeding returns `429 Too Many Requests`
- Wait **1 minute** before retrying

### Webhook Signature Verification

Steps to verify:
1. Stringify the payload body
2. Append secret key: `stringify(payload) + secret_key`
3. Encrypt using SHA256

### Webhooks Setup

- Configure at: **Pengaturan -> Developer -> Webhook**
- Set Callback URL per event
- Must set **Webhook Secret Key** first
- Non-200 responses trigger up to **3 retry attempts**

### Error Code & Status Code List

### Error Codes

#### Warehouse Activity Error Codes

| Code | Activity | Description |
|------|----------|-------------|
| P9001 | Putaway Items | Qty input exceeds actual transaction Qty |
| P9002 | Putaway Items | Serial number only belongs to 1 specific item |
| P9003 | Putaway Items | Failed to save item placement |
| P9004 | Putaway Items | Qty based on batch number exceeds actual qty |
| P9005 | Inventory Stock Adjustment | Transaction will cause inventory Qty on shelf to be minus |
| P9006 | Putaway Items | Expired date cannot be empty |
| P9007 | Putaway Items | Input Bundle SKU |
| 30001 | Serial/Batch Validation | Item does not have a serial number |
| 30002 | Serial/Batch Validation | Item does not have a batch number |
| 30003 | Serial/Batch Validation | Can only use serial or batch number |
| 30004 | Serial/Batch Validation | Unable to adjust stocks already in stock opname |
| 30005 | Serial Movement Validation | Expired date only for items with batch number |
| 30006 | Serial Movement Validation | Expired date must be filled for batch number items |
| 30007 | Serial Movement Validation | Expired date mismatch for SKU/batch |
| 30008 | Serial Movement Validation | Transaction causes negative qty for SKU with batch |
| 30009 | Serial Movement Validation | Transaction causes negative qty for SKU with serial |
| 30010 | Serial Movement Validation | Serial number must be unique (already registered at location) |
| 30011 | Serial Movement Validation | Serial number already used for SKU |
| 30012 | Serial Movement Validation | Batch number already used for SKU |

#### Transaction/Order/Product Error Codes

| Code | Condition | Description |
|------|-----------|-------------|
| 23502 | not_null_violation | Required field not filled |
| 23503 | foreign_key_violation | ID doesn't exist or record is used in another transaction |
| 23505 | unique_violation | Record number already exists |
| 23113 | journal_unbalance | Credit and Debit not equal |
| 23114 | error_transaction | Down payment already deducted from bill payment |
| 10001 | error_transaction | Cannot modify transactions within locked period |
| 23100 | error_inventory | Inventory transaction value would be minus |
| 23101 | error_inventory | Inventory qty is 0 but value is not 0 |
| 23102 | error_transaction | Transaction would be minus |
| 23504 | error_transaction | Product bundle contents use another bundle |
| 23103 | error_transaction | Payments exceed bill value |
| 23108 | error_transaction | Payment exceeds invoice value |
| 23115 | error_transaction | Down payment deducted from invoice payment |
| 23116 | error_transaction | Return qty exceeds invoice |
| 23104 | error_transaction | Payment exceeds invoice value |
| 23106 | error_transaction | Payment exceeds bill value |
| 23105 | error_return_item | Refund exceeds return value |
| 23107 | error_return_item | Refund exceeds return value |
| 23109 | error_return_item | Invoice deduction exceeds return value |
| 23111 | error_return_item | Bill deduction exceeds return value |
| 23110 | error_transaction | Invoice deduction exceeds invoice value |
| 23112 | error_transaction | Bill deduction exceeds bill value |
| 20501 | error_promotion | Another promotion exists on that date |
| 90000 | error_auth | Invalid username or password |
| 90001 | error_auth | Invalid old password |
| 90002 | error_courier | Courier cannot be used for account |
| 90003 | error_product_bundle | Products with transactions cannot be bundled |
| E000001 | error_data | Data does not exist in Jubelio |
| E000002 | error_promotion | Promotion overlapping |
| E000003 | error_field | Missing required parameter |
| E000004 | error_transaction | Transfer already on the road |
| E000005 | error_order | Order status doesn't support label printing |
| E000006 | error_integration | No integrated channel (need at least 1) |
| E000007 | error_page | Page has changed since last opened |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing required parameter |
| 401 | Unauthorized - Invalid/missing/expired token |
| 402 | Request Failed |
| 403 | Forbidden - No permissions |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests - Wait 1 minute |
| 500 | Server Error |

---

## Inventory Stock Types

Jubelio has 4 types of item stock:
- **On-Hand**: Total physical stock in warehouse
- **On-Order**: Stock ordered/reserved by customers
- **On-Reserved**: Stock reserved/allocated
- **Available**: `On Hand - On Order - On Reserved`

## WMS (Warehouse Management System) Overview

Capabilities:
- Add warehouse locations (address, staff, marketplace fulfillment)
- Set rack/shelf plans (floor, row, column, shelf number)
- **Inbound Process**: PO creation, receive items, putaway, product returns, stock adjustment/opname
- **Outbound Process**: Order fulfillment (pick/pack/ship), stock transfer, product returns to suppliers, stock adjustment
- **Light WMS**: Skip packing and/or shipping process

---

## Complete API Endpoint Reference

### Authentication (1 endpoints)

#### `POST /login`

- **Operation ID**: `postLogin`
- **Summary**: Login
- **Description**: Login API is used to get Token. And the Token is to used to call other API.
- **Request Body Schema**: `loginRequest`
- **Response 200**: `loginResponse`
- **Response 500**: `loginError`

### Region (4 endpoints)

#### `GET /region/provinces`

- **Operation ID**: `GetProvinces`
- **Summary**: Get Provinces
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getProvinces`
- **Response 500**: `internalServerError`

#### `GET /region/subdistricts/?district_id={district_id}`

- **Operation ID**: `GetSubdistricts`
- **Summary**: Get Subdistricts
- **Parameters** (2):
  - `` (in: , optional)
  - `district_id` (in: path, required, type: `string`, example: `110507`) - District ID
- **Response 200**: `getSubdistricts`
- **Response 500**: `internalServerError`

#### `GET /region/cities/?province_id={province_id}`

- **Operation ID**: `GetCities`
- **Summary**: Get Cities
- **Parameters** (2):
  - `` (in: , optional)
  - `province_id` (in: path, required, type: `string`, example: `11`) - Province ID
- **Response 200**: `getCities`
- **Response 500**: `internalServerError`

#### `GET /region/districts/?city_id={city_id}`

- **Operation ID**: `GetDistricts`
- **Summary**: Get Districts
- **Parameters** (2):
  - `` (in: , optional)
  - `city_id` (in: path, required, type: `string`, example: `1105`) - City ID
- **Response 200**: `getDistricts`
- **Response 500**: `internalServerError`

### Product (34 endpoints)

#### `POST /inventory/catalog/`

- **Operation ID**: `postInventoryCatalog`
- **Summary**: Create/Edit Product
- **Parameters** (1):
  - `` (in: , optional)
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/{channel_id}/store-categories/{store_id}`

- **Operation ID**: `getStoreCategories`
- **Summary**: Get Store Categories
- **Parameters** (3):
  - `` (in: , optional)
  - `channel_id` (in: path, required, type: `number`, example: `1`) - Channel ID
  - `store_id` (in: path, required, type: `number`, example: `1`) - Store ID
- **Response 200**: `getStoreCategoriesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/{id}/attributes-value/`

- **Operation ID**: `getAttributeValues`
- **Summary**: Get Attributes Values
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Category ID
- **Response 200**: `getAttributeValuesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/{id}/attributes/`

- **Operation ID**: `getCategoryAttributes`
- **Summary**: Get Category Attributes
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Category ID
- **Response 200**: `getCategoryAttributesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/{id}/variations/`

- **Operation ID**: `getCategoryVariants`
- **Summary**: Get Category Variants
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Category ID
- **Response 200**: `getCategoryVariantsResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/category-map/{id}`

- **Operation ID**: `getCategoryMap`
- **Summary**: Get Category Mapping to Marketplace
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Category ID
- **Response 200**: `getCategoryMappingResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/item-categories/`

- **Operation ID**: `getInventoryCategoriesItemcategories`
- **Summary**: Get All Categories
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getCategoriesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/item-categories/information/{id}/`

- **Operation ID**: `getInventoryCategoriesItemcategoriesInformationId`
- **Summary**: Get Category Information
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Category ID
- **Response 200**: `getCategoryResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/item-bundles/`

- **Operation ID**: `getInventoryItembundles`
- **Summary**: Get All Bundles
- **Parameters** (9):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
  - `channelId` (in: query, optional, type: `number`) - Item on Channel ID
  - `isFavourite` (in: query, optional, type: `boolean`) - Is Favorite Item [true/false]
- **Response 200**: `getBundlesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/`

- **Operation ID**: `getInventoryItems`
- **Summary**: Get All Product Groups
- **Parameters** (9):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
  - `channelId` (in: query, optional, type: `number`) - Item on Channel ID
  - `isFavourite` (in: query, optional, type: `boolean`) - Is Favorite Item [true/false]
- **Response 200**: `getProductsResponse`
- **Response 500**: `internalServerError`

#### `DELETE /inventory/items/`

- **Operation ID**: `deleteInventoryItems`
- **Summary**: Delete Product
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/`

- **Operation ID**: `postProductBundle`
- **Summary**: Create/Edit Product Bundle
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveProductBundleRequest`
- **Response 200**: `saveProductBundleResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/{id}`

- **Operation ID**: `getInventoryItemsId`
- **Summary**: Get Product
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Item ID
- **Response 200**: `getProductResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/archive/`

- **Operation ID**: `setItemToArchive`
- **Summary**: Archive Product
- **Description**: Use this endpoint if you want to archive your product in **Jubelio System**. Remember that you still have to archive your product in the marketplace in order to stop the selling for a while.
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `statusOK`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/archived/`

- **Operation ID**: `getInventoryItemsArchived`
- **Summary**: Get All Archived Product
- **Parameters** (9):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsArchivedResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/restore/`

- **Operation ID**: `setItemToRestore`
- **Summary**: Restore Product From Archive
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `statusOK`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/all-stocks/`

- **Operation ID**: `productInventory`
- **Summary**: Get Product Stocks by Ids
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getInventoryResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/by-sku/{sku}`

- **Operation ID**: `getInventoryItemsByskuSku`
- **Summary**: Get Product by Sku
- **Parameters** (2):
  - `` (in: , optional)
  - `sku` (in: path, required, type: `string`) - Item Code
- **Response 200**: `getProductResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/channel-category-attributes/`

- **Operation ID**: `getChannelAttributes`
- **Summary**: Get All Channel Attributes
- **Parameters** (2):
  - `id` (in: query, required, type: `string`) - Channel Category ID
  - `channel_id` (in: query, required, type: `number`) - Channel ID
- **Response 200**: `getChannelAttributesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/channel-category-tree/`

- **Operation ID**: `getChannelCategory`
- **Summary**: Get All Channel Category Tree
- **Parameters** (2):
  - `id` (in: query, required, type: `string`) - Channel Category ID
  - `channel_id` (in: query, required, type: `number`) - Channel ID
- **Response 200**: `getChannelCategoryResponse`
- **Response 500**: `internalServerError`

#### `DELETE /inventory/items/item-variant/`

- **Operation ID**: `deleteItemVariant`
- **Summary**: Delete Item Variant
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/group/{id}`

- **Operation ID**: `getInventoryItemsGroupId`
- **Summary**: Get Product Group
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Item Group ID
- **Response 200**: `getProductResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/prices/`

- **Operation ID**: `productPrices`
- **Summary**: Get Product Prices by Ids
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getPriceListResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/reviews/`

- **Operation ID**: `getInventoryItemsReview`
- **Summary**: Get All Review Product
- **Parameters** (9):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
  - `channelId` (in: query, optional, type: `number`) - Item on Channel ID
  - `isFavourite` (in: query, optional, type: `boolean`) - Is Favorite Item [true/false]
- **Response 200**: `getProductsReviewResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/masters`

- **Operation ID**: `getInventoryItemsMaster`
- **Summary**: Get All Master Product
- **Parameters** (9):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
  - `channelId` (in: query, optional, type: `number`) - Item on Channel ID
  - `isFavourite` (in: query, optional, type: `boolean`) - Is Favorite Item [true/false]
- **Response 200**: `getProductsMasterResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/internal-price-list/`

- **Operation ID**: `getInventoryPricelist`
- **Summary**: Get All Product Prices
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getPriceListResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/price-list/`

- **Operation ID**: `postInventoryPricelist`
- **Summary**: Edit Product Prices
- **Description**: ![](https://drive.google.com/uc?id=1p7Jxp8jqbvr4BMl0ijhTEMHmoEP0XeuE)  | No   | Endpoints                          | Function                                                     | | ---- | -----------
- **Parameters** (1):
  - `authorization` (in: header, required, type: `string`)
- **Request Body Schema**: `savePriceListRequest`
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `GET /inventory/promotions/`

- **Operation ID**: `getInventoryPromotions`
- **Summary**: Get All Promotions
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Promotion Name]
  - `` (in: , optional)
- **Response 200**: `getPromotionsResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/promotions/`

- **Operation ID**: `postInventoryPromotions`
- **Summary**: Create Promotion
- **Description**: ![](https://drive.google.com/uc?id=1b-BvVyMEfRpVzN6CqZc2Bu3hXwQnwvkv)  | No   | Endpoints                  | Function                                                     | | ---- | -------------------
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `savePromotionRequest`
- **Response 200**: `savePromotionResponse`
- **Response 500**: `internalServerError`

#### `DELETE /inventory/promotions/`

- **Operation ID**: `deleteInventoryPromotions`
- **Summary**: Delete Promotion
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /inventory/promotions/{id}`

- **Operation ID**: `getInventoryPromotionsId`
- **Summary**: Get Promotion
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Promotion ID
- **Response 200**: `getPromotionResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/search-brands/`

- **Operation ID**: `getInventorySearchbrands`
- **Summary**: Get All Brands
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Brand Name]
  - `` (in: , optional)
- **Response 200**: `getBrandsResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/upload-image`

- **Operation ID**: `postInventoryImagesNew`
- **Summary**: Upload Product Image
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveImageRequestNew`
- **Response 200**: `saveImageResponse`
- **Response 500**: `internalServerError`

#### `GET /variations`

- **Operation ID**: `getAllVariations`
- **Summary**: Get All Variations
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
- **Response 200**: `getVariations`
- **Response 500**: `internalServerError`

### Product Listing (8 endpoints)

#### `GET /blibli/pickupPoints`

- **Operation ID**: `getBlibliPickUp`
- **Summary**: Get All Blibli PickUp Points
- **Parameters** (2):
  - `` (in: , optional)
  - `store_id` (in: query, required, type: `number`) - Store Id
- **Response 200**: `getBlibliPickUpPoints`
- **Response 500**: `internalServerError`

#### `GET /inventory/catalog/for-listing/{id}`

- **Operation ID**: `getProductListing`
- **Summary**: Product Listing
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `string`, example: `1`) - Item Group ID
- **Response 200**: `getProductListingResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/catalog/listing`

- **Operation ID**: `saveProductListing`
- **Summary**: Create/Update Product Listing
- **Description**: Use this endpoint to create your product listing before uploading your product to marketplace channel. If the product is already listed on the marketplace, use this endpoint to update your product lis
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveProductListing`
- **Response 200**: `saveProductListingResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/catalog/upload`

- **Operation ID**: `uploadProductListing`
- **Summary**: Upload Product Listing
- **Description**: Use this endpoint to upload your product to a marketplace.
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `uploadProductListing`
- **Response 500**: `internalServerError`

#### `GET /inventory/categories/channel-categories/{parent_id}`

- **Operation ID**: `getChannelCategories`
- **Summary**: Channel Categories
- **Description**: To find a category that matched with your products in the marketplace, you can use this endpoint so you can get **category_id** to later get the **channel_category_id**.   **channel_category_id** is t
- **Parameters** (3):
  - `` (in: , optional)
  - `parent_id` (in: path, required, type: `number`) - Parent ID. Set 0 to get all the list of category_id available on the marketplace.
  - `id` (in: query, required, type: `string`) - Refers to channel_id. See the table above.
- **Response 200**: `getChannelCategoriesResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/errors/`

- **Operation ID**: `getUploadErrors`
- **Summary**: Upload Failed
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
- **Response 200**: `getUploadProductErrorsResponse`
- **Response 500**: `internalServerError`

#### `GET /shopee/logistics`

- **Operation ID**: `getShopeeLogistics`
- **Summary**: Get Shopee Logistics
- **Description**: For shopee, we need to add the logistics before uploading product to the MP. <br> Pick at least 1 logistic based on the response from this API.
- **Parameters** (2):
  - `` (in: , optional)
  - `store_id` (in: query, required, type: `number`, example: `1`) - Store ID
- **Response 200**: `getShopeeLogisticResponse`
- **Response 500**: `internalServerError`

#### `GET /tokopedia/showcases`

- **Operation ID**: `getTokopediaShowcases`
- **Summary**: Get Tokopedia Showcases
- **Parameters** (2):
  - `` (in: , optional)
  - `store_id` (in: query, required, type: `string`, example: `1`) - Store ID
- **Response 200**: `getTokopediaShowcasesResponse`
- **Response 500**: `internalServerError`

### Inventory (57 endpoints)

#### `POST /inventory/reserved/`

- **Operation ID**: `CreateReservedStockItem`
- **Summary**: Create Reserved Stock Item
- **Request Body Schema**: `CreateReservedStockItem`
- **Response 200**: `ResponseReservedStock`
- **Response 500**: `internalServerError`

#### `GET /inventory/reserved/`

- **Operation ID**: `getListReservedStock`
- **Summary**: Get List Reserved Stock
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getListReservedStockResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/reserved/{id}`

- **Operation ID**: `getDetailReservedStock`
- **Summary**: Get Detail Reserved Stock
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Reserved Stock ID
- **Response 200**: `getDetailReservedStockResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/to-stock/{location_id}`

- **Operation ID**: `getItemsToStockByLocation`
- **Summary**: Get Inventory Item To Stock By Location
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Location ID
- **Response 200**: `getItemsToStockByLocationResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/received/author`

- **Operation ID**: `postInventoryItemsReceivedAuthor`
- **Summary**: Assign Staff to do Putaway
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `AssignStaffRequest`
- **Response 200**: `PutawayPostResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/`

- **Operation ID**: `getInventory`
- **Summary**: Get All Products Stock
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Item Name/Item Code]
- **Response 200**: `getInventoryResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/group/merge-catalog`

- **Operation ID**: ``
- **Summary**: Merge Similar Items In Catalog
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postMergeCatalog`
- **Response 200**: `postMergeCatalogResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/putaway/all`

- **Operation ID**: `getInventoryPutawayAll`
- **Summary**: Get Putaway ID
- **Description**: You can sort by **putaway_no**.
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryPutawayAllResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/putaway/not-start`

- **Operation ID**: `getInventoryPutawayNotStart`
- **Summary**: List of putaway items that still not started
- **Description**: You can sort by **putaway_no**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryPutawayNotStartResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/putaway/processed`

- **Operation ID**: `getInventoryPutawayProcessed`
- **Summary**: List of putaway items that have been processed
- **Description**: You can sort by **putaway_no**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryPutawayProcessedResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/putaway/completed`

- **Operation ID**: `getInventoryPutawayCompleted`
- **Summary**: List of putaway items that already done putaway
- **Description**: You can sort by **complete_date*
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryPutawayCompleted`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/received/item/{putaway_id}`

- **Operation ID**: `getInventoryItemsReceivedPutawayID`
- **Summary**: Get List of Putaway Items
- **Description**: You can sort by **item_code**.
- **Parameters** (7):
  - `putaway_id` (in: path, required, type: `string`, example: `123`) - Putaway ID
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReceiveItemPutawayResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/to-buy`

- **Operation ID**: `getInventoryItemsToBuy`
- **Summary**: Get List of Products To Buy (in PO)
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsToBuy`
- **Response 500**: `internalServerError`

#### `GET /inventory/activity/`

- **Operation ID**: `getInventoryProductActivity`
- **Summary**: Get Inventory Product Stock History
- **Parameters** (5):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `itemId` (in: query, required, type: `number`) - Item Id
- **Response 200**: `getInventoryActivityResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/adjustments/`

- **Operation ID**: `getInventoryAdjustments`
- **Summary**: Get All Stock Adjustments
- **Description**: You can sort by **transaction_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Item Adjustment Number]
- **Response 200**: `getAllStockAdjustmentsResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/adjustments/`

- **Operation ID**: `postInventoryAdjustments`
- **Summary**: Create/Edit Stock Adjustment
- **Description**: This API is used to create/edit adjustment stock. To get **bin_id**, you can use [GET/wms/default-bin/{location_id}](https://docs-wms.jubelio.com/#operation/getWMSDefaultBin) or [GET/locations/bin/{lo
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `adjusmentRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `DELETE /inventory/adjustments/`

- **Operation ID**: `deleteInventoryAdjustments`
- **Summary**: Delete Stock Adjustment
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /inventory/adjustments/{id}`

- **Operation ID**: `getInventoryAdjustmentsId`
- **Summary**: Get Stock Adjustment
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Adjustment ID
- **Response 200**: `getStockAdjustmentResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/catalog/{group_id}`

- **Operation ID**: `getItemCatalogId`
- **Summary**: Get Item Catalog
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: query, required, type: `number`, example: `1`) - Item Group ID
- **Response 200**: `getItemCatalogResponse`

#### `POST /inventory/catalog/set-master`

- **Operation ID**: `postInventoryCatalogSetMaster`
- **Summary**: Set Product to 'Master' from 'In Review'
- **Description**: Use this endpoint to push your products to 'Master' menu.
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postInventoryCatalogSetMasterRequest`
- **Response 200**: `postInventoryCatalogSetMasterResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/received/putaway`

- **Operation ID**: `postInventoryItemsReceivedPutaway`
- **Summary**: Putaway Items
- **Description**: Use this endpoint to count items that have been placed by input the quantity and bin_id (bin code to place the items)
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postInventoryItemsPutawayRequest`
- **Response 200**: `postInventoryItemsPutawayResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/received/finish-putaway`

- **Operation ID**: `postInventoryItemsReceivedFinishPutaway`
- **Summary**: Set Putaway Process As Finish
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `getInventoryItemsReceivedFinishPutawayRequest`
- **Response 200**: `getInventoryItemsReceivedFinishPutawayResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/to-stock/`

- **Operation ID**: `getInventoryItemsToStock`
- **Summary**: Get all the items that stock needs to adjust
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsToStockResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/to-sales-return`

- **Operation ID**: `getInventoryItemsToSalesReturn`
- **Summary**: Get List of Sales Return Items
- **Description**: You can sort by **item_code**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsToSalesReturnResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/by-transfer/{item_transfer_id}`

- **Operation ID**: `getInventoryItemsbyTransferid`
- **Summary**: Get List of Products to Receive based on Transfer No.
- **Parameters** (7):
  - `item_transfer_id` (in: path, required, type: `number`) - Item Transfer ID
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsbyTransferid`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/received`

- **Operation ID**: `getInventoryItemsReceived`
- **Summary**: Get List of Items Have Been Received
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsReceivedResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/{id}/batch-number`

- **Operation ID**: `getItemBatchNumber`
- **Summary**: Get Item Batch Number
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Item ID
- **Response 200**: `getItemBatchNumberResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/split-item`

- **Operation ID**: `postSplitItem`
- **Summary**: Split Item
- **Description**: Split Item in Product Catalog
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `SplitItemRequest`
- **Response 200**: `SplitItemPostResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/by-invoice/{invoice_id}`

- **Operation ID**: `getInventoryItemsbyInvoice`
- **Summary**: Get Items List by Invoice No.
- **Parameters** (7):
  - `` (in: , optional)
  - `invoice_id` (in: path, required, type: `string`) - Invoice ID
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsbyInvoiceResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/to-adjust/`

- **Operation ID**: `setItemToAdjust`
- **Summary**: Get Item Cost and Stock
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `inline(2 props)`
- **Response 200**: `setItemToAdjustResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/to-sell/{location_id}`

- **Operation ID**: `getItemsToSell`
- **Summary**: Get Items To Sell
- **Parameters** (7):
  - `` (in: , optional)
  - `location_id` (in: path, required, type: `string`) - Location ID
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getItemsToSellResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/floors`

- **Operation ID**: `getInventoryStockOpnameFloors`
- **Summary**: Get the rack location by floors where the items are placed
- **Description**: You can sort by **floor_code**.
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameFloorsResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/rows`

- **Operation ID**: `getInventoryStockOpnameRows`
- **Summary**: Get the rack location by rows where the items are placed
- **Description**: You can sort by **row_code**.
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameRowsResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/columns`

- **Operation ID**: `getInventoryStockOpnameColumns`
- **Summary**: Get the rack location by columns where the items are placed
- **Description**: You can sort by **column_code**.
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameColumnsResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/stock-opname`

- **Operation ID**: `postInventoryStockOpname`
- **Summary**: Create item list to opname
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postInventoryStockOpnameRequest`
- **Response 200**: `postInventoryStockOpnameResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname`

- **Operation ID**: `getInventoryStockOpname`
- **Summary**: Get all the list of stock opname from all status (recently created, on process, or final)
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/{opname_header_id}`

- **Operation ID**: `getInventoryStockOpnameOpnameHeaderId`
- **Summary**: Get the real-time stock while the stock opname still on progress
- **Parameters** (3):
  - `` (in: , optional)
  - `opname_header_id` (in: path, required, type: `number`) - Opname Header ID
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameOpnameHeaderIdResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/bins`

- **Operation ID**: `getInventoryStockOpnameBins`
- **Summary**: Get All Bin ID by Location ID
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameBinsResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/items`

- **Operation ID**: `getInventoryStockOpnameItems`
- **Summary**: Get all the items to be opname
- **Description**: You can sort by **item_full_name**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameItemsResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/stock-opname/finalize`

- **Operation ID**: `postInventoryStockOpnameFinalize`
- **Summary**: Set Stock Opname Process As Done & Push Final Stock
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postInventoryStockOpnameFinalizeRequest`
- **Response 200**: `postInventoryStockOpnameFinalizeResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/need-restock/`

- **Operation ID**: `getNeedRestockProducts`
- **Summary**: Get All Need Restock Product
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
- **Response 200**: `getNeedRestockProductsResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/out-of-stock-in-order/`

- **Operation ID**: `getOutOfStockInOrderProducts`
- **Summary**: Get All Out Of Stock In Order Product
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter By [item_code/item_name]. Please exclude special character.
- **Response 200**: `getOutOfStockInOrderProductsResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/stock-opname/items/filtered`

- **Operation ID**: `getInventoryStockOpnameItemsFiltered`
- **Summary**: Get all the items to be opname filtered by rack location
- **Parameters** (3):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryStockOpnameItemsFilteredResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/revaluations/`

- **Operation ID**: `postInventoryAmountAdjustments`
- **Summary**: Create/Edit Amount Adjustment
- **Description**: This API is used to create/edit adjustment amount.
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `adjustmentAmountRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `POST /inventory/transfer/mark-printed`

- **Operation ID**: `inventoryTransferMarkPrinted`
- **Summary**: Mark Item Transfer as Printed
- **Request Body Schema**: `inline(1 props)`
- **Response 500**: `internalServerError`

#### `POST /inventory/transfers/`

- **Operation ID**: `postInventoryTransfers`
- **Summary**: Create Stock Transfer (In/Out)
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `inventoryTransferRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `DELETE /inventory/transfers/`

- **Operation ID**: `deleteInventoryTransfers`
- **Summary**: Delete Stock Transfer
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfers/{id}`

- **Operation ID**: `getInventoryTransfersId`
- **Summary**: Get Stock Transfer
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Transfer ID
- **Response 200**: `getInventoryTransferResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfers/in`

- **Operation ID**: `getInventoryTransfersIn`
- **Summary**: Get Stock Transfer In
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryTransferInResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfers/all-transit`

- **Operation ID**: `getInventoryTransfersAllTransit`
- **Summary**: Get all the transaction numbers for the transfers
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryTransfersAllTransitResponses`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfers/out`

- **Operation ID**: `getInventoryTransfersOut`
- **Summary**: Get Stock Transfer Out
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryTransferOutResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfers/out-finished`

- **Operation ID**: `getInventoryTransfersOutFinished`
- **Summary**: Get All the List of Transfers that have been finished/received.
- **Description**: You can sort by **transaction_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryTransfersOutFinishedResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfers/transit`

- **Operation ID**: `getInventoryTransfersTransit`
- **Summary**: Get Stock Transfer Transit
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryTransfersTransitResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/transfer/delivery`

- **Operation ID**: `getInventoryTransferDelivery`
- **Summary**: Print Transfer Delivery Report
- **Parameters** (3):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryTransferDeliveryResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/by-bill/{doc_id}`

- **Operation ID**: `getInventoryItemsByBill`
- **Summary**: Get Purchase Return Items Detail
- **Description**: You can sort by **item_code**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `doc_id` (in: path, required, type: `number`) - Doc ID
- **Response 200**: `getInventoryItemsbyBillResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/received/auto-putaway`

- **Operation ID**: `postInventoryItemsAutoputaway`
- **Summary**: Set items to be Auto-putaway
- **Description**: Bill ID/Transfer ID/Return ID **is required** based on **the type of your items**, whether your items is a received items, transfer items, or return items.
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `ItemsAutoPutawayRequest`
- **Response 200**: `PutawayPostResponse`
- **Response 500**: `internalServerError`

#### `GET /inventory/items/item-on-stock`

- **Operation ID**: `getInventoryItemsItemOnStock`
- **Summary**: Get Items List to Transfer
- **Description**: You can sort by **item_code**.
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInventoryItemsItemOnStockResponse`
- **Response 500**: `internalServerError`

### Location & The Rack Plan (8 endpoints)

#### `GET /wms/default-bin/{location_id}`

- **Operation ID**: `getWMSDefaultBin`
- **Summary**: Get Default Bin by Location ID
- **Parameters** (2):
  - `` (in: , optional)
  - `location_id` (in: path, required, type: `string`) - Location ID
- **Response 200**: `getDefaultBinResponse`
- **Response 500**: `internalServerError`

#### `GET /locations/`

- **Operation ID**: `getLocations`
- **Summary**: Get All Locations
- **Description**: This API is used to show all locations that the user has/saved. The saved location can be used as a store inventory or a shipping address.
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Location Name]
  - `` (in: , optional)
- **Response 200**: `getLocationsResponse`
- **Response 500**: `internalServerError`

#### `POST /locations/`

- **Operation ID**: `postLocations`
- **Summary**: Create/Edit Location & Rack Plan
- **Description**: This API is used to create/edit location of the warehouse. You can also set your rack plan (using `layout` property), start from floor level, row number, column number and bin number. You are able to 
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveLocationRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `DELETE /locations/`

- **Operation ID**: `deleteLocations`
- **Summary**: Delete Location
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /locations/{id}`

- **Operation ID**: `getLocationsId`
- **Summary**: Get Location
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Location ID
- **Response 200**: `getLocationResponse`
- **Response 500**: `internalServerError`

#### `GET /locations/bin/{location_id}`

- **Operation ID**: `getBinByLocationID`
- **Summary**: Get Bin by Location ID
- **Description**: You can sort by **bin_final_code**.
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `location_id` (in: path, required, type: `string`, example: `1`) - Location ID
- **Response 200**: `getBinByLocationIDResponse`
- **Response 500**: `internalServerError`

#### `GET /locations/pos`

- **Operation ID**: `getLocationsPos`
- **Summary**: Get All Locations that have POS Outlets
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getLocationsResponse`
- **Response 500**: `internalServerError`

#### `GET /locations/store/`

- **Operation ID**: `getLocationsStore`
- **Summary**: Get Location Store Mapping
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getLocationStoresResponse`
- **Response 500**: `internalServerError`

### WMS (Warehouse Management System) (34 endpoints)

#### `GET /wms/couriers`

- **Operation ID**: `getWMSCourier`
- **Summary**: Get Courier List
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getWMSCourierResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/shipments/{courier_new_id}`

- **Operation ID**: `getWMSSalesShipmentsCourierNewId`
- **Summary**: Get list of shipments based on specific courier
- **Parameters** (4):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `courier_new_id` (in: path, required, type: `string`) - Courier New ID
- **Response 200**: `getWMSSalesShipmentsCourierNewIdResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/shipments/instant/all`

- **Operation ID**: `getWMSSalesShipmentsInstantAll`
- **Summary**: Get all shipment schedule for instant courier
- **Parameters** (3):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesShipmentsInstantAllResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/scan-shipment`

- **Operation ID**: `postWMSScanShipment`
- **Summary**: Get Shipment Schedule by Scanning Shipment Number
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSScanShipmentRequest`
- **Response 200**: `postWMSScanShipmentResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/shipments/`

- **Operation ID**: `postWMSShipments`
- **Summary**: Create Shipment Schedule for Regular Courier
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSShipmentsRequest`
- **Response 200**: `postWMSShipmentsResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/picklists/change-picker/`

- **Operation ID**: `postWMSSalesPicklistsChangePicker`
- **Summary**: Change Picker Staff
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesPicklistsChangePickerRequest`
- **Response 200**: `postWMSSalesPicklistsChangePickerResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/shipment-detail/`

- **Operation ID**: `postWMSShipmentDetail`
- **Summary**: Add Order to Shipment Schedule
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSShipmentDetailRequest`
- **Response 200**: `postWMSShipmentDetailResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/shipments/instant-courier/`

- **Operation ID**: `postWMSShipmentsInstantCourier`
- **Summary**: Create Shipment Schedule for Instant Courier
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSShipmentsInstantCourierRequest`
- **Response 200**: `postWMSShipmentsInstantCourierResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/orders/ready-to-pick/`

- **Operation ID**: `getWMSSalesOrdersReadyToPick`
- **Summary**: Get list of orders that are ready to pick
- **Description**: You can use this endpoint if you want to get all of orders from all sales channels (Marketplace & other channel). You can sort by **transaction_date**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesOrdersReadyToPickResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/shipments/completed/{shipment_type}/{courierIds}`

- **Operation ID**: `getWMSSalesShipmentsCompleted`
- **Summary**: Get the list of shipments which are already on delivery
- **Parameters** (5):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `shipment_type` (in: path, required, type: `string`)
  - `courierIds` (in: path, required, type: `string`)
- **Response 200**: `getWMSSalesShipmentsCompletedResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/shipped/`

- **Operation ID**: `getWMSSalesShipped`
- **Summary**: Get the list of orders which are already shipped by the courier
- **Description**: You can sort by **shipment_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesShippedResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/orders/empty-stock/`

- **Operation ID**: `getSalesOrdersEmptyStock`
- **Summary**: Get List of Orders that Stock is Empty
- **Description**: You can sort by **transaction_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getSalesOrdersEmptyStockResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/picklists/confirm-pick/`

- **Operation ID**: `getWMSSalesPicklistsConfirmPick`
- **Summary**: Get list of orders that are on picking process
- **Description**: You can sort by **picklist_id**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesPicklistsConfirmPickResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/shipments/all`

- **Operation ID**: `getWMSSalesShipmentsAll`
- **Summary**: Get all shipment schedule for regular courier
- **Parameters** (3):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesShipmentsAllResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/order/ready-to-ship`

- **Operation ID**: `getWMSSalesOrderReadyToShip`
- **Summary**: Get list of orders that are need to send to the courier
- **Description**: You can sort by **transaction_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesOrderReadyToShipResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/packlists/finish-pack/`

- **Operation ID**: `getWMSSalesPacklistFinishPack`
- **Summary**: Get the list of orders that are finished packing
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesPacklistFinishPackResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/packlist/scan-order`

- **Operation ID**: `getWMSSalesPacklistVerifySalesOrder`
- **Summary**: Get list of items to pack
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesPacklistVerifySalesOrderResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/ready-to-process`

- **Operation ID**: `postWMSSalesReadyToProcess`
- **Summary**: Move orders from the 'empty-stock' and 'failed pick' to 'ready to process' list
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesReadyToProcessRequest`
- **Response 200**: `postWMSSalesReadyToProcessResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/shipments/orders/`

- **Operation ID**: `postWMSSalesShipmentsOrders`
- **Summary**: Get the AWB (Airway Bill) for the order
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesShipmentsOrdersRequest`
- **Response 200**: `postWMSSalesShipmentsOrdersResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/ready-to-pick`

- **Operation ID**: `postWMSSalesReadyToPick`
- **Summary**: Move orders from 'ready to process' to 'ready to pick' list
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesReadyToPickRequest`
- **Response 200**: `postWMSSalesReadyToPickResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/orders/request-cancel/`

- **Operation ID**: `getWMSSalesOrdersRequestCancel`
- **Summary**: Get all orders that customers asked to cancel
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesOrdersRequestCancelResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/orders/failed-pick`

- **Operation ID**: `getWMSSalesOrdersFailedPick`
- **Summary**: Get list of orders that are canceled to pick
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesOrdersFailedPickResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/orders/finish-pick/`

- **Operation ID**: `getWMSSalesOrdersFinishPick`
- **Summary**: Get list of orders that are finished picking
- **Description**: You can sort by **transaction_date**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesOrdersFinishPickResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/packlist/update-qty-packed`

- **Operation ID**: `postWMSSalesPacklistUpdateQTYPacked`
- **Summary**: Update quantity of item that has been packed
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesPacklistUpdateQTYPackedRequest`
- **Response 200**: `postWMSSalesPacklistUpdateQTYPackedResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/packlist/verify-barcode/`

- **Operation ID**: `postWMSSalesPacklistVerifyBarcode`
- **Summary**: Verify Item/Sku/Barcode/Serial/Batch
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesPacklistVerifyBarcode`
- **Response 200**: `postWMSSalesPacklistVerifyBarcodeResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/packlist/mark-as-complete/`

- **Operation ID**: `postWMSSalesPacklistMarkAsComplete`
- **Summary**: Mark Order As Ready To Ship (Done Packing)
- **Description**: Use salesorder_id as ids
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesPacklistMarkAsCompleteRequest`
- **Response 200**: `postWMSSalesPacklistMarkAsCompleteResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/sales/packlists/process/`

- **Operation ID**: `getWMSSalesPacklistsProcess`
- **Summary**: Get the list of orders that are on the packing process
- **Description**: You can sort by **transaction_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesPacklistsProcessResponse`
- **Response 500**: `internalServerError`

#### `GET /wms/employee/{NIKorEmail}`

- **Operation ID**: `getWMSEmployee`
- **Summary**: Get The Employee ID/Warehouse Staff Information
- **Parameters** (2):
  - `NIKorEmail` (in: path, required, type: `string`) - Email or NIK (Nomor Induk Karyawan = Employee Identity Number) of the Warehouse Staff.
  - `` (in: , optional)
- **Response 500**: `internalServerError`

#### `GET /wms/sales/orders/ready-to-process/`

- **Operation ID**: `getWMSSalesOrdersReadyToProcess`
- **Summary**: Get All Ready To Process Orders
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getWMSSalesOrdersReadyToProcessResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/orders/change-location/`

- **Operation ID**: `changeLocationforOrders`
- **Summary**: Change Location for Orders
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `changeLocationforOrders`
- **Response 200**: `statusOK`
- **Response 500**: `internalServerError`

#### `POST /wms/order/getOrderByNo/`

- **Operation ID**: `postWMSOrderGetOrderByNo`
- **Summary**: Get Sales Order that Items wants to Pick
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSOrderGetOrderByNoRequest`
- **Response 200**: `postWMSOrderGetOrderByNoResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/shipments/get-order/`

- **Operation ID**: `postWMSShipmentsGetOrder`
- **Summary**: Update quantity of items that has already given to the courier
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSShipmentsGetOrderRequest`
- **Response 200**: `postWMSShipmentsGetOrderResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/picklists/`

- **Operation ID**: `postWMSSalesPicklists`
- **Summary**: Create Picklist - Set Picklist Complete
- **Description**: Using this endpoint, you can either create your item picklist **(Create Picklist Request)** or even set your picking process as complete. **(Update Picklist Request)**
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `postWMSSalesPicklistsResponse`
- **Response 500**: `internalServerError`

#### `POST /wms/sales/packlist`

- **Operation ID**: `postWMSSalesPacklists`
- **Summary**: Create Packlist
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postWMSSalesCreatePacklistsRequest`
- **Response 200**: `postWMSSalesPacklistsResponse`
- **Response 500**: `internalServerError`

### Sales (60 endpoints)

#### `GET /sales/orders/completed/`

- **Operation ID**: `getSalesOrdersCompleted`
- **Summary**: Get all completed orders from all sales channels
- **Description**: You can sort by **transaction_date**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getSalesOrdersResponse`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/complete-return/`

- **Operation ID**: `setItemToNotReturn`
- **Summary**: Set Item to Not Return
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/reject-return/`

- **Operation ID**: `rejectReturnRequest`
- **Summary**: Reject Return Request
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `POST /inventory/items/to-return/`

- **Operation ID**: `setItemToReturn`
- **Summary**: Accept Sales Return
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /sales/`

- **Operation ID**: `getSales`
- **Summary**: Get All Sales
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sale Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getInvoicesResponse`
- **Response 500**: `internalServerError`

#### `DELETE /sales/`

- **Operation ID**: `deleteSales`
- **Summary**: Delete Sales Return/Invoice
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /sales/invoices/`

- **Operation ID**: `getSalesInvoices`
- **Summary**: Get All Invoices
- **Parameters** (11):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Invoice Number/Customer Name]
  - `store_name` (in: query, optional, type: `string`) - Store Name
  - `` (in: , optional)
- **Response 200**: `getInvoicesResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/invoices/`

- **Operation ID**: `postSalesInvoices`
- **Summary**: Create/Edit Invoice
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveInvoiceRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `GET /sales/invoices/for-return-wms/{contact_id}`

- **Operation ID**: `getSalesInvoicesbyContactID`
- **Summary**: Get Invoice ID from Sales Return
- **Description**: You can sort by **invoice_no**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `contact_id` (in: path, required, type: `number`, example: `1`) - Contact ID
- **Response 200**: `getSalesInvoicesbyContactIDResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/invoices/{id}`

- **Operation ID**: `getSalesInvoicesId`
- **Summary**: Get Invoice
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Invoice ID
- **Response 200**: `getInvoiceResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/invoices/overdue/`

- **Operation ID**: `getSalesInvoicesOverdue`
- **Summary**: Get All 'Due' Invoices
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getInvoicesResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/invoices/summary/`

- **Operation ID**: `getSalesInvoicesSummary`
- **Summary**: Get All Invoices Based on Store
- **Parameters** (5):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getInvoicesSummaryResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/invoices/unpaid/`

- **Operation ID**: `getSalesInvoicesUnpaid`
- **Summary**: Get All 'Outstanding' Invoices
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getInvoicesResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/orders/`

- **Operation ID**: `postSalesOrders`
- **Summary**: Create/Edit Sales Order
- **Description**: ![](https://drive.google.com/uc?id=1Mtydt3SgqnGh6Hn9nCrj9d07BN88cWOh)  | Endpoint                                                     | Notes                                                        | |
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveSalesOrderRequest`
- **Response 200**: `saveID`
- **Response 500**: `internalServerError`

#### `DELETE /sales/orders/`

- **Operation ID**: `deleteSalesOrders`
- **Summary**: Delete Sales Order
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /sales/orders/{id}`

- **Operation ID**: `getSalesOrdersId`
- **Summary**: Get Sales Order
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Sales Order ID
- **Response 200**: `getSalesOrderResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/orders/cancel/`

- **Operation ID**: `getSalesOrdersCancel`
- **Summary**: Get All 'Cancelled' Sales Orders
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name/Channel Name/Item Code/Item Name]
  - `` (in: , optional)
- **Response 200**: `getSalesOrdersResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/orders/delete-canceled`

- **Operation ID**: `postSalesOrdersDeleteCanceled`
- **Summary**: Delete Cancelled items
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveDeleteCanceledRequest`
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `GET /sales/orders/failed/`

- **Operation ID**: `getSalesOrdersFailed`
- **Summary**: Get 'Failed' Sales Orders
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name/Channel Name/Item Code/Item Name]
  - `` (in: , optional)
- **Response 200**: `getSalesOrdersResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/picklists/{picklist_id}`

- **Operation ID**: `getSalesPicklistsbyPicklistID`
- **Summary**: Get Items Picklist
- **Parameters** (2):
  - `` (in: , optional)
  - `picklist_id` (in: path, required, type: `string`) - Picklist ID
- **Response 200**: `getSalesPicklistsbyPicklistIDResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/orders/mark-as-complete`

- **Operation ID**: `postSalesOrdersMarkascomplete`
- **Summary**: Mark Sales Order as Complete
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `GET /sales/orders/returned-list/`

- **Operation ID**: `getSalesOrdersReturned`
- **Summary**: Get 'Returned' Sales Orders
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name/Channel Name/Item Code/Item Name]
  - `` (in: , optional)
- **Response 200**: `getSalesOrdersReturnedResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/orders/save-airwaybill/`

- **Operation ID**: `saveAirwayBill`
- **Summary**: Update Sales Order AWB
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveAirwayBillRequest`
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `POST /sales/orders/save-received-date`

- **Operation ID**: `updateReceivedDateSalesOrder`
- **Summary**: Update Sales Order Received Date
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveReceivedDateRequest`
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `POST /sales/orders/set-as-paid`

- **Operation ID**: `setAsPaid`
- **Summary**: Set Sales Order as Paid
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `GET /sales/packlists/`

- **Operation ID**: `getSalesPacklists`
- **Summary**: Get All Packlist
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name/Channel Name/Item Code/Item Name]
  - `` (in: , optional)
- **Response 200**: `getPacklistsResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/shipments/{shipment_header_id}`

- **Operation ID**: `getSalesShipmentsShipmentHeaderId`
- **Summary**: Get list of items that are ready to ship based on shipment schedule
- **Parameters** (2):
  - `` (in: , optional)
  - `shipment_header_id` (in: path, required, type: `number`) - Shipment Header ID
- **Response 200**: `getSalesShipmentsShipmentHeaderIdResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/packlists/{id}`

- **Operation ID**: `getSalesPacklistsId`
- **Summary**: Get Packlist
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `7`) - Sales Order Detail ID
- **Response 200**: `getPacklistResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/packlists/create-invoice-payment`

- **Operation ID**: `createInvoicePayment`
- **Summary**: Convert Sales Order to Invoice with Payment
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `createInvoiceRequest`
- **Response 200**: `createInvoiceResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/packlists/create-invoice`

- **Operation ID**: `createInvoice`
- **Summary**: Convert Sales Order to Invoice
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `createInvoiceRequest`
- **Response 200**: `createInvoiceResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/packlists/shipped/`

- **Operation ID**: `getSalesPacklistsShipped`
- **Summary**: Get 'Shipped' Sales Orders
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name/Channel Name/Item Code/Item Name]
  - `` (in: , optional)
- **Response 200**: `getShippedOrdersResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/payments/`

- **Operation ID**: `getSalesPayments`
- **Summary**: Get All Invoice Payments
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getSalesPaymentsResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/payments/`

- **Operation ID**: `postSalesPayments`
- **Summary**: Create/Edit Invoice Payment
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveSalesPaymentRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `DELETE /sales/payments/`

- **Operation ID**: `deleteSalesPayments`
- **Summary**: Delete Invoice Payment
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /sales/payments/{id}`

- **Operation ID**: `getSalesPaymentsId`
- **Summary**: Get Invoice Payment
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `17`) - Purchase Payment ID
- **Response 200**: `getSalesPaymentResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/picklists/items-to-pick`

- **Operation ID**: `getItemsToPick`
- **Summary**: Get List Item to Pick
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getItemsToPickResponse`
- **Response 500**: `internalServerError`

#### `DELETE /sales/picklists/to-ship/`

- **Operation ID**: `deletePicklist`
- **Summary**: Delete Picklist
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `POST /sales/request-awb-order/`

- **Operation ID**: `requestAwbOrder`
- **Summary**: Request AWB Order
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `inline(1 props)`
- **Response 200**: `requestAwbOrderResponse`
- **Response 400**: `requestAwbOrderError`

#### `GET /sales/return-settlements/`

- **Operation ID**: `getSalesReturnsettlements`
- **Summary**: Get All Sales Return Settlements
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getSalesReturnInvoicesResponse`
- **Response 500**: `internalServerError`

#### `DELETE /sales/return-settlements/`

- **Operation ID**: `deleteSalesReturnsettlements`
- **Summary**: Delete Sales Return Settlement
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /sales/return-settlements/invoices/`

- **Operation ID**: `getSalesReturnsettlementsInvoices`
- **Summary**: Get All Sales Return Settlement Invoice
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getSalesReturnInvoicesResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/return-settlements/invoices/`

- **Operation ID**: `postSalesReturnsettlementsInvoices`
- **Summary**: Create/Edit Sales Return Settlement Invoice
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveSalesReturnInvoiceRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `GET /sales/return-settlements/invoices/{id}`

- **Operation ID**: `getSalesReturnsettlementsInvoicesId`
- **Summary**: Get Sales Return Settlement Invoice
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Settlement ID
- **Response 200**: `getSalesReturnInvoiceResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/return-settlements/refunds/`

- **Operation ID**: `getSalesReturnsettlementsRefunds`
- **Summary**: Get All Sales Return Settlement Refund
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `POST /sales/return-settlements/refunds/`

- **Operation ID**: `postSalesReturnsettlementsRefunds`
- **Summary**: Create/Edit Sales Return Settlement Refund
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveSalesReturnRefundRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `GET /sales/return-settlements/refunds/{id}`

- **Operation ID**: `getSalesReturnsettlementsRefundsId`
- **Summary**: Get Sales Return Settlement Refund
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Refund ID
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `GET /sales/returns/items/`

- **Operation ID**: `getItemReturns`
- **Summary**: Get All Item Returns
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Order Number/Customer Name/Channel/Status/SKU]
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReturnsResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/returns/items/unprocessed/wms`

- **Operation ID**: `getSalesReturnsItemsUnprocessedWMS`
- **Summary**: Get the list of unprocess sales return
- **Description**: You can sort by **transaction_date**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getSalesReturnsItemsUnprocessedWMSResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/returns/items/rejected/`

- **Operation ID**: `getRejectedItemReturns`
- **Summary**: Get 'Rejected - Returned' Sales Orders
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Order Number/Customer Name/Channel/Status/SKU]
  - `` (in: , optional)
- **Response 200**: `getRejectedReturnsResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/returns/items/resolved/`

- **Operation ID**: `getApprovedItemReturns`
- **Summary**: Get 'Resolved/Approved - Returned' Sales Orders
- **Parameters** (9):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name/Channel Name/Item Code/Item Name]
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getApprovedReturnsResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/sales-returns/`

- **Operation ID**: `getSalesSalesreturns`
- **Summary**: Get All Sales Returns
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getSalesReturnsResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/sales-returns/`

- **Operation ID**: `postSalesSalesreturns`
- **Summary**: Receive Sales Return
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveSalesReturnRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `GET /sales/sales-returns/{id}`

- **Operation ID**: `getSalesSalesreturnsId`
- **Summary**: Get Sales Return
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Sales Return ID
- **Response 200**: `getSalesReturnResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/sales-returns/unpaid/`

- **Operation ID**: `getSalesSalesreturnsUnpaid`
- **Summary**: Get All 'Outstanding' Sales Returns
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getSalesReturnsResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/settlements/`

- **Operation ID**: `getSalesSettlements`
- **Summary**: Get All Sales Settlements
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Sales Order Number/Customer Name]
  - `` (in: , optional)
- **Response 200**: `getSalesSettlementsResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/settlements/{id}`

- **Operation ID**: `getSalesSettlement`
- **Summary**: Get Sales Settlement
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Contact ID
- **Response 200**: `getSalesSettlementResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/shipments/orders/`

- **Operation ID**: `shipmentOrders`
- **Summary**: Shipment Orders
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `inline(1 props)`
- **Response 200**: `shipmentsOrdersResponse`
- **Response 500**: `internalServerError`

#### `GET /sales/unfullfilled/`

- **Operation ID**: `getSalesUnfullfilled`
- **Summary**: Get All Packlist
- **Parameters** (8):
  - `authorization` (in: header, required, type: `string`)
  - `page` (in: query, optional, type: `number`)
  - `pageSize` (in: query, optional, type: `number`)
  - `sortDirection` (in: query, optional, type: `string`)
  - `sortBy` (in: query, optional, type: `string`)
  - `csv` (in: query, optional, type: `string`)
  - `q` (in: query, optional, type: `string`)
  - `createdSince` (in: query, optional, type: `string`)

#### `POST /sales/shipments/`

- **Operation ID**: `postSalesShipments`
- **Summary**: Set Items As Complete/ Is Already Received by The Courier
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postSalesShipmentsRequest`
- **Response 200**: `postSalesShipmentsResponse`
- **Response 500**: `internalServerError`

#### `POST /sales/picklists/items-to-pick/`

- **Operation ID**: `postSalesPicklistsItemToPick`
- **Summary**: Get List Of Items To Pick
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postSalesPicklistsItemToPickRequest`
- **Response 200**: `postSalesPicklistsItemToPickResponse`
- **Response 500**: `internalServerError`

### Purchasing (30 endpoints)

#### `DELETE /purchase/`

- **Operation ID**: `deletePurchase`
- **Summary**: Delete Purchase Return
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/bills/`

- **Operation ID**: `getPurchaseBills`
- **Summary**: Get All Bills
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getBillsResponse`
- **Response 500**: `internalServerError`

#### `POST /purchase/bills/`

- **Operation ID**: `postPurchaseBills`
- **Summary**: Create/Edit Bill
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveBillRequest`
- **Response 500**: `internalServerError`

#### `DELETE /purchase/bills/`

- **Operation ID**: `deletePurchaseBills`
- **Summary**: Delete Bill
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/bills/for-return`

- **Operation ID**: `getPurchaseBillsForReturn`
- **Summary**: Get the bill number to return
- **Description**: You can sort by **doc_number**
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getPurchaseBillsForReturnResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/bills/{id}`

- **Operation ID**: `getPurchaseBillsId`
- **Summary**: Get Bill
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `3`) - Bill ID
- **Response 200**: `getBillResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/bills/overdue/`

- **Operation ID**: `getPurchaseBillsOverdue`
- **Summary**: Get All 'Due' Bills
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getBillsResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/bills/unpaid/`

- **Operation ID**: `getPurchaseBillsUnpaid`
- **Summary**: Get All 'Outstanding' Bills
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getBillsResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/orders/`

- **Operation ID**: `getPurchaseOrders`
- **Summary**: Get All Purchase Orders
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Purchase Order Number/Supplier Name]
  - `` (in: , optional)
- **Response 200**: `getPurchaseOrdersResponse`
- **Response 500**: `internalServerError`

#### `POST /purchase/orders/`

- **Operation ID**: `postPurchaseOrders`
- **Summary**: Create/Edit Purchase Order
- **Description**: ![](https://drive.google.com/uc?id=1eDwG7qKmr9pgN8sn8KfRCpGhl2KTumsR)  | Endpoint                                                     | Notes                                                        | |
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `savePurchaseOrderRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `DELETE /purchase/orders/`

- **Operation ID**: `deletePurchaseOrders`
- **Summary**: Delete Purchase Order
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/orders/{id}`

- **Operation ID**: `getPurchaseOrdersId`
- **Summary**: Get Purchase Order
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Purchase Order ID
- **Response 200**: `getPurchaseOrderResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/orders/progress`

- **Operation ID**: `getPurchaseOrdersProgress`
- **Summary**: Get All PO receive progress
- **Parameters** (6):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getPurchaseOrdersProgressResponses`
- **Response 500**: `internalServerError`

#### `GET /purchase/payments/`

- **Operation ID**: `getPurchasePayments`
- **Summary**: Get All Bill Payments
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Purchase Order Number/Supplier Name]
  - `` (in: , optional)
- **Response 200**: `getPurchaseOrdersResponse`
- **Response 500**: `internalServerError`

#### `POST /purchase/payments/`

- **Operation ID**: `postPurchasePayments`
- **Summary**: Create/Edit Bill Payment
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `savePurchasePayment`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `DELETE /purchase/payments/`

- **Operation ID**: `deletePurchasePayments`
- **Summary**: Delete Bill Payment
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/payments/{id}`

- **Operation ID**: `getPurchasePaymentsId`
- **Summary**: Get Bill Payment
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Payment ID
- **Response 200**: `getPurchasePaymentResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/purchase-returns/`

- **Operation ID**: `getPurchasePurchasereturns`
- **Summary**: Get All Purchase Returns
- **Description**: You can sort by **transaction_date**
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Purchase Return Number/Supplier Name]
- **Response 200**: `getPurchaseReturnsResponse`
- **Response 500**: `internalServerError`

#### `POST /purchase/purchase-returns/`

- **Operation ID**: `postPurchasePurchasereturns`
- **Summary**: Create/Edit Purchase Return
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `savePurchaseReturnRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `POST /purchase/serial-number/mark-printed`

- **Operation ID**: `postPurchaseSerialNumberMarkPrinted`
- **Summary**: Print Product Barcodes to Putaway
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postPurchaseSerialNumberMarkPrintedRequest`
- **Response 200**: `postPurchaseSerialNumberMarkPrintedResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/purchase-returns/{id}`

- **Operation ID**: `getPurchasePurchasereturnsId`
- **Summary**: Get Purchase Return
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Return ID
- **Response 200**: `getPurchaseReturnResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/purchase-returns/unpaid/`

- **Operation ID**: `getPurchasePurchasereturnsUnpaid`
- **Summary**: Get All 'Outstanding' Purchase Returns
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Purchase Return Number/Supplier Name]
  - `` (in: , optional)
- **Response 200**: `getPurchaseReturnsResponse`
- **Response 500**: `internalServerError`

#### `DELETE /purchase/return-settlements/`

- **Operation ID**: `deletePurchaseReturnsettlements`
- **Summary**: Delete Purchase Return Settlement
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/return-settlements/bills/`

- **Operation ID**: `getPurchaseReturnsettlementsBills`
- **Summary**: Get All Purchase Return Settlement Bills
- **Parameters** (10):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Purchase Order Number/Supplier Name]
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getPurchaseReturnSettlementBillsResponse`
- **Response 500**: `internalServerError`

#### `POST /purchase/return-settlements/bills/`

- **Operation ID**: `postPurchaseReturnsettlementsBills`
- **Summary**: Create/Edit Purchase Return Settlement Bill
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveReturnSettlementBillRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/return-settlements/bills/{id}`

- **Operation ID**: `getPurchaseReturnsettlementsBillsId`
- **Summary**: Get Purchase Return Settlement Bill
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Purchase Return Settlement ID
- **Response 200**: `getPurchaseReturnSettlementBillResponse`
- **Response 500**: `internalServerError`

#### `GET /purchase/return-settlements/refunds/`

- **Operation ID**: `getPurchaseReturnsettlementsRefunds`
- **Summary**: Get All Purchase Return Settlement Refund
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Purchase Return Number/Supplier Name]
  - `` (in: , optional)
- **Response 200**: `getPurchaseReturnSettlementBillsResponse`
- **Response 500**: `internalServerError`

#### `POST /purchase/return-settlements/refunds/`

- **Operation ID**: `postPurchaseReturnsettlementsRefunds`
- **Summary**: Create/Edit Purchase Return Settlement Refund
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `savePurchaseReturnSettlementRefundRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

#### `GET /purchase/return-settlements/refunds/{id}`

- **Operation ID**: `getPurchaseReturnsettlementsRefundsId`
- **Summary**: Get Purchase Return Settlement Refund
- **Parameters** (2):
  - `authorization` (in: header, required, type: `string`)
  - `id` (in: path, required, type: `number`)

#### `GET /purchase/serial-number/wms/{bill_detail_id}`

- **Operation ID**: `getPurchaseSerialNumberWMS`
- **Summary**: Get Serial Number/Batch Number of Items
- **Description**: You can also use GET/purchase/batch-number/wms/{bill_detail_id} to get the batch number
- **Parameters** (2):
  - `` (in: , optional)
  - `bill_detail_id` (in: path, required, type: `number`) - Bill Detail ID
- **Response 200**: `getPurchaseSerialNumberWMSResponse`
- **Response 500**: `internalServerError`

### Couriers (3 endpoints)

#### `GET /couriers`

- **Operation ID**: `getCouriers`
- **Summary**: Get All Couriers
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getCouriersResponse`
- **Response 500**: `internalServerError`

#### `GET /couriers/{id}`

- **Operation ID**: `getCouriersId`
- **Summary**: Get Courier
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Courier ID
- **Response 200**: `getCourierResponse`
- **Response 500**: `internalServerError`

#### `GET /couriers/tenant/{id}`

- **Operation ID**: `getCouriersTenantId`
- **Summary**: Get Tenant Courier
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`) - Courier ID
- **Response 200**: `getCourierResponse`
- **Response 500**: `internalServerError`

### Channels (1 endpoints)

#### `GET /marketplace/store/`

- **Operation ID**: `getMarketplaceStore`
- **Summary**: Get All Stores
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query
  - `` (in: , optional)
- **Response 200**: `getAllStoresResponse`
- **Response 500**: `internalServerError`

### Contact (8 endpoints)

#### `GET /contact/category/`

- **Operation ID**: `getContactCategory`
- **Summary**: Get Contact Category
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Category Code/Category Name]
  - `` (in: , optional)
- **Response 200**: `getContactCategoryResponse`
- **Response 500**: `internalServerError`

#### `GET /contacts/`

- **Operation ID**: `getContacts`
- **Summary**: Get All Contacts
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone/Email]
- **Response 200**: `getContactsResponse`
- **Response 500**: `internalServerError`

#### `POST /contacts/`

- **Operation ID**: `postContacts`
- **Summary**: Create/Edit Contact
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveContactRequest`
- **Response 500**: `internalServerError`

#### `DELETE /contacts/`

- **Operation ID**: `deleteContacts`
- **Summary**: Delete Contact
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `deleteOK`
- **Response 500**: `internalServerError`

#### `GET /contacts/{id}`

- **Operation ID**: `getContactsId`
- **Summary**: Get Contact
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Contact ID
- **Response 200**: `getContactResponse`
- **Response 500**: `internalServerError`

#### `GET /contacts/customers-suppliers/`

- **Operation ID**: `getContactsCustomerssuppliers`
- **Summary**: Get Customers and Vendors
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getContactsResponse`
- **Response 500**: `internalServerError`

#### `GET /contacts/customers/`

- **Operation ID**: `getContactsCustomers`
- **Summary**: Get Customers
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getContactsResponse`
- **Response 500**: `internalServerError`

#### `GET /contacts/suppliers/`

- **Operation ID**: `getContactsSuppliers`
- **Summary**: Get Vendors
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getContactsResponse`
- **Response 500**: `internalServerError`

### Journal (5 endpoints)

#### `GET /accounts/lookup/all`

- **Operation ID**: `getAccountLookupAll`
- **Summary**: Get Account Lookup
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getAccountLookupResponse`
- **Response 500**: `internalServerError`

#### `GET /journal/`

- **Operation ID**: `getJournal`
- **Summary**: Get All Journal
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getJournalResponse`
- **Response 500**: `internalServerError`

#### `GET /journal/{id}`

- **Operation ID**: `getJournalById`
- **Summary**: Get Journal By Id
- **Parameters** (2):
  - `` (in: , optional)
  - `id` (in: path, required, type: `number`, example: `1`) - Location ID
- **Response 200**: `getJournalByIdResponse`
- **Response 500**: `internalServerError`

#### `GET /journal/manual-journal/`

- **Operation ID**: `getJournalManual`
- **Summary**: Get All Manual Journal
- **Parameters** (8):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `q` (in: query, optional, type: `string`) - Filter Query [Contact Name/Primary Contact/Phone]
  - `` (in: , optional)
- **Response 200**: `getJournalResponse`
- **Response 500**: `internalServerError`

#### `POST /journal/manual-journal/`

- **Operation ID**: `postManualJournal`
- **Summary**: Create/Edit Manual Journal
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveManualJournalRequest`
- **Response 200**: `saveOK`
- **Response 500**: `internalServerError`

### Cash & Bank (4 endpoints)

#### `GET /cashbank/payments/`

- **Operation ID**: `getPayments`
- **Summary**: Get Payments
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getCashbankReceivesResponse`
- **Response 500**: `internalServerError`

#### `GET /cashbank/payments/id`

- **Operation ID**: `getPaymentsById`
- **Summary**: Get Payment By Id
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getCashbankPaymentByIdResponse`
- **Response 500**: `internalServerError`

#### `GET /cashbank/receives`

- **Operation ID**: `getReceives`
- **Summary**: Get Receives
- **Parameters** (7):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getCashbankReceivesResponse`
- **Response 500**: `internalServerError`

#### `GET /cashbank/receives/id`

- **Operation ID**: `getReceivesById`
- **Summary**: Get Receive By Id
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getCashbankReceiveByIdResponse`
- **Response 500**: `internalServerError`

### Reports (13 endpoints)

#### `GET /lazada/get-document/`

- **Operation ID**: `printLazadaInvoiceLabel`
- **Summary**: Print Lazada Invoice/Label
- **Parameters** (5):
  - `` (in: , optional)
  - `ids` (in: query, required, type: `array`) - List Sales Order ID
  - `document_type` (in: query, required, type: `string`) - Type:
  * `shippingLabel` - for Print Label
  * `invoice` - for Print Invoice

  - `store_id` (in: query, required, type: `string`) - Store ID
  - `title` (in: query, optional, type: `string`, example: `Shipping Label Lazada`) - Title
- **Response 500**: `internalServerError`

#### `GET /reports/receive`

- **Operation ID**: `getReportsReceive`
- **Summary**: Print Receive Bill for Purchase Order
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsReceiveResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/consign`

- **Operation ID**: `getReportsConsign`
- **Summary**: Print Receive Bill for Consignment Products
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsConsignResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/invoice`

- **Operation ID**: `getReportsInvoice`
- **Summary**: Print Invoice
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsInvoiceResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/lable/print/`

- **Operation ID**: `reportShippingLabelPrint`
- **Summary**: Print Shipping Label
- **Description**: This API returns the URL shipping lable in inside object or the HTML for Lazada. <br> **This only can use for one Id since Lazada returns the HTML by itself.**
- **Parameters** (3):
  - `` (in: , optional)
  - `ids` (in: query, required, type: `array`) - Sales Order ID <br> Example: [255200]
  - `useJubelioLazadaLable` (in: query, optional, type: `boolean`) - Use Jubelio Lazada Lable <br> Example: true
- **Response 200**: `getReportShippingLabel`
- **Response 500**: `internalServerError`

#### `GET /reports/purchaseorder/`

- **Operation ID**: `getReportsPurchaseOrderDetail`
- **Summary**: Print PO Details
- **Parameters** (3):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsPurchaseOrderDetailResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/stock-opname`

- **Operation ID**: `getReportsStockOpname`
- **Summary**: Print List OF Items To Do Opname
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsStockOpname`
- **Response 500**: `internalServerError`

#### `GET /reports/shipping-label/`

- **Operation ID**: `getReportShippingLabel`
- **Summary**: Print Shipping Label
- **Description**: This endpoint is to Print shipping lable with multiple order ids
- **Parameters** (3):
  - `` (in: , optional)
  - `` (in: , optional)
  - `ids[]` (in: query, optional, type: `array`) - List Order ID
- **Response 200**: `getReportShippingLabel`
- **Response 500**: `internalServerError`

#### `GET /reports/wms/shipping-manifest`

- **Operation ID**: `getReportsWMSShippingManifest`
- **Summary**: Print Proof Of Delivery Reports
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsWMSShippingManifestResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/putaway`

- **Operation ID**: `getReportsPutaway`
- **Summary**: Get The Putaway Reports
- **Parameters** (3):
  - `` (in: , optional)
  - `ids%5B0%5D` (in: query, required, type: `array`) - Putaway ID you want to print
  - `` (in: , optional)
- **Response 200**: `reportPutawayResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/item-receive-notplace`

- **Operation ID**: `getReportsItemReceivedNotPlace`
- **Summary**: Get the list of received items that have not been placed.
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsItemReceivedNotPlaceResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/adjustment`

- **Operation ID**: `getReportsAdjustmentStock`
- **Summary**: Print Stock Adjustment Report
- **Parameters** (2):
  - `` (in: , optional)
  - `tz` (in: query, required, type: `string`) - Input default value = Asia%2FBangkok
- **Response 200**: `getReportsAdjustmentStockResponse`
- **Response 500**: `internalServerError`

#### `GET /reports/wms/pick-list`

- **Operation ID**: `getReportsWMSPicklist`
- **Summary**: Print Item Picklist
- **Parameters** (2):
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getReportsWMSPicklistResponse`
- **Response 500**: `internalServerError`

### System Setting (8 endpoints)

#### `GET /systemsetting/sales-return-setting`

- **Operation ID**: `getSalesReturnSetting`
- **Summary**: Get Sales Return Setting
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `getSalesReturnSetting`
- **Response 500**: `internalServerError`

#### `POST /systemsetting/sales-return-setting`

- **Operation ID**: `postSalesReturnSetting`
- **Summary**: Create Sales Return Setting
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `postSalesReturnSetting`
- **Response 200**: `responseSalesReturnSetting`
- **Response 500**: `internalServerError`

#### `GET /store-locations/`

- **Operation ID**: `storeLocations`
- **Summary**: Store Locations
- **Parameters** (5):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `storeLocationsResponse`
- **Response 500**: `internalServerError`

#### `GET /systemsetting/account-mapping`

- **Operation ID**: `accountMappingSetting`
- **Summary**: Account Mapping
- **Parameters** (1):
  - `` (in: , optional)
- **Response 200**: `systemsettingAccountMappingResponse`
- **Response 500**: `internalServerError`

#### `GET /systemsetting/users/`

- **Operation ID**: `getSystemSettingUser`
- **Summary**: Get List of User of the Jubelio Account / Warehouse Staff
- **Description**: You can sort by **email**.
- **Parameters** (5):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `getSystemSettingUserResponse`
- **Response 500**: `internalServerError`

#### `POST /systemsetting/webhook`

- **Operation ID**: `postWebhook`
- **Summary**: Create/Edit Webhook
- **Parameters** (1):
  - `` (in: , optional)
- **Request Body Schema**: `saveWebhookRequest`
- **Response 200**: `ok`
- **Response 500**: `internalServerError`

#### `GET /lazada/get-shipment-providers/{storeId}/`

- **Operation ID**: `getLazadaShipmentProviders`
- **Summary**: Get Lazada Shipment Providers Information
- **Parameters** (2):
  - `` (in: , optional)
  - `storeId` (in: path, required, type: `number`, example: `2234`) - Store ID
- **Response 200**: `getLazadaShipmentProvidersResponse`
- **Response 500**: `internalServerError`

#### `GET /taxes/`

- **Operation ID**: `taxes`
- **Summary**: Taxes
- **Parameters** (5):
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
  - `` (in: , optional)
- **Response 200**: `systemsettingTaxesResponse`
- **Response 500**: `internalServerError`

### Webhooks (9 endpoints)

#### `POST /webhooks/invoice`

- **Operation ID**: `getInvoicekWebhook`
- **Summary**: New Invoice
- **Description**: This Webhook will be called when Invoice created or updated from Application
- **Request Body Schema**: `webhookInvoice`
- **Response 200**: `ok`

#### `POST /webhooks/payment`

- **Operation ID**: `getPaymentWebhook`
- **Summary**: Update Payment
- **Description**: This Webhook will be called when there is a price change from the application.
- **Request Body Schema**: `webhookPayment`
- **Response 200**: `ok`

#### `POST /webhooks/price`

- **Operation ID**: `getPriceWebhook`
- **Summary**: Update Price
- **Description**: This Webhook will be called when there is a price change from the application.
- **Request Body Schema**: `webhookPrice`
- **Response 200**: `ok`

#### `POST /webhooks/product`

- **Operation ID**: `getProductWebhook`
- **Summary**: New Product
- **Description**: This Webhook will be called when Product created or updated from Application.
- **Request Body Schema**: `webhookProduct`
- **Response 200**: `ok`

#### `POST /webhooks/purchaseorder`

- **Operation ID**: `getPurchaseOrderWebhook`
- **Summary**: New Purchase Order
- **Description**: This Webhook will be called when a new Purchase Order is created from Application
- **Request Body Schema**: `webhookPurchaseOrder`
- **Response 200**: `ok`

#### `POST /webhooks/salesorder`

- **Operation ID**: `getSalesOrderWebhook`
- **Summary**: Update Sales Order
- **Description**: This Webhook will be called when there are additions or changes to orders such as 'Created' to 'In Progress'
- **Request Body Schema**: `webhookSalesOrder`
- **Response 200**: `ok`

#### `POST /webhooks/salesreturn`

- **Operation ID**: `getSalesReturnWebhook`
- **Summary**: New Sales Return
- **Description**: This Webhook will be called when a new Sales Return is created from Application.
- **Request Body Schema**: `webhookSalesReturn`
- **Response 200**: `ok`

#### `POST /webhooks/stock`

- **Operation ID**: `getStockWebhook`
- **Summary**: Update Stock
- **Description**: This Webhook will be called when there is a stock change that can occur when there are orders, stock transfers, returns, etc.
- **Request Body Schema**: `webhookStock`
- **Response 200**: `ok`

#### `POST /webhooks/stocktransfer`

- **Operation ID**: `getStockTransferWebhook`
- **Summary**: New Stock Transfer
- **Description**: This Webhook will be called when a new Stock Transfer is created from Application
- **Request Body Schema**: `webhookStockTransfer`
- **Response 200**: `ok`

---

## Complete Schema Definitions

### Schema: `getProvinces`

- **Type**: `object`
- **Properties** (2):
  - `province_id` (`string`) - Province ID | example: `36`
  - `name` (`string`) - Province Name | example: `BANTEN`

### Schema: `internalServerError`

- **Type**: `object`
- **Properties** (4):
  - `statusCode` (`string`) - Error Status Code | example: `500`
  - `error` (`string`) - Error Title | example: `Internal Server Error`
  - `message` (`string`) - Error Message | example: `An internal server error occurred`
  - `code` (`string`) - Error Code | example: `42601`

### Schema: `getSubdistricts`

- **Type**: `object`
- **Properties** (3):
  - `subdistrict_id` (`string`) - Subdistrict ID | example: `1105072002`
  - `district_id` (`string`) - District ID | example: `110507`
  - `name` (`string`) - Area Name | example: `Alue Batee`

### Schema: `getCities`

- **Type**: `object`
- **Properties** (3):
  - `city_id` (`string`) - City ID | example: `1105`
  - `province_id` (`string`) - Province ID | example: `11`
  - `name` (`string`) - City Name | example: `KAB. ACEH BARAT DAYA`

### Schema: `getDistricts`

- **Type**: `object`
- **Properties** (3):
  - `district_id` (`string`) - District ID | example: `110507`
  - `city_id` (`string`) - City ID | example: `1105`
  - `name` (`string`) - District Name | example: `Arongan Lambalek`

### Schema: `getListReservedStockResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List of Reserved Stock
    - **Array item properties** (11):
      - `reservedstock_id` (`number`) - Reserved Stock ID | example: `194`
      - `reservedstock_no` (`string`) - Reserved Stock Number | example: `RSRV-000000194`
      - `location_id` (`string`) - Location ID | example: `-1`
      - `location_name` (`string`) - Location Name | example: `Pusat`
      - `start_date` (`string`) - Time when reserved stock has started | example: `2024-05-06T07:00:00.000Z`
      - `end_date` (`string`) - Time when reserved stock has ended | example: `2024-05-07T09:00:00.000Z`
      - `note` (`string`)
      - `is_active` (`boolean`) - Whether the reserved stock active or not | example: `False`
      - `created_by` (`string`) - Employee who is creating reserved stock | example: `ririn@gmail.com`
      - `is_ongoing` (`boolean`) - Whether the reserved stock is on going or not | example: `False`
      - `is_internal` (`boolean`) - Whether the reserved stock is internal or not | example: `True`

### Schema: `CreateReservedStockItem`

- **Type**: `object`
- **Required fields**: `reservedstock_no`, `reservedstock_id`, `start_date`, `end_date`, `location_id`
- **Properties** (9):
  - `reservedstock_no` (`string`) - Reserved Stock Number. This number will be automatically generated by Jubelio System, but you may edit it if you want to custom the number. | example: `['auto']`
  - `reservedstock_id` (`number`) - Reserved Stock ID. To create new, set the value with 0. | example: `0`
  - `start_date` (`string`) - Start date for the reserved stock | example: `2022-10-04T04:00:00.000Z`
  - `end_date` (`string`) - Start date for the reserved stock | example: `2022-10-04T04:00:00.000Z`
  - `location_id` (`number`) - Location ID | example: `61`
  - `is_active` (`boolean`) - Whether the reserved stock is already active or not | example: `True`
  - `is_active_prev_state` (`boolean`)
  - `note` (`string`) - Note
  - `items` (`array of object`)
    - **Array item properties** (4):
      - `reservedstock_detail_id` (`number`) - Reserved stock detail ID. Set the value with 0 to create new. | example: `0`
      - `item_id` (`string`) - Item ID | example: `10384`
      - `qty_in_base` (`number`) - Quantity of stock you want to reserve. | example: `7`
      - `store_id` (`number`) - Store ID | example: `46283`

### Schema: `ResponseReservedStock`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Reserved Stock Status | example: `ok`
  - `id` (`number`) - reservedstock_id | example: `19`

### Schema: `getDetailReservedStockResponse`

- **Type**: `object`
- **Properties** (12):
  - `items` (`array of object`) - Detail of Reserved Stock
    - **Array item properties** (7):
      - `reservedstock_detail_id` (`number`) - Reserved Stock Detail ID | example: `19`
      - `item_id` (`number`) - Item ID | example: `789`
      - `qty_in_base` (`string`) - Item Quantity Updates | example: `2.000`
      - `store_id` (`string`) - Store ID
      - `item_full_name` (`string`) - Item Full Name | example: `01-HIT-M - Kaos Pria Hitam Legam S-M`
      - `channel_full_name` (`string`) - Channel Full Name | example: ` `
      - `item_active` (`boolean`) - Whether item is active | example: `True`
  - `location_name` (`string`) - Location Name | example: `Jakarta`
  - `created_by` (`string`) - Created By | example: `ririn@gmail.com`
  - `reservedstock_id` (`number`) - Reserved Stock ID | example: `23`
  - `created_date` (`string`) - Created Date | example: `2023-04-18T06:37:13.860Z`
  - `start_date` (`string`) - Start date for the reserved stock | example: `2023-04-19T08:01:00.000Z`
  - `end_date` (`string`) - End date for the reserved stock | example: `2023-04-19T08:01:00.000Z`
  - `reservedstock_no` (`string`) - Reserved Stock Number | example: `RSRV-000000025`
  - `note` (`string`) - Note | example: `antisipasi lebaran`
  - `location_id` (`string`) - Location ID | example: `3`
  - `is_active` (`boolean`) - Whether reserved stock is active | example: `False`
  - `extra_info` (`string`) - Extra Info

### Schema: `getItemsToStockByLocationResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Items To Stock By Location
    - **Array item properties** (17):
      - `item_id` (`number`) - Item ID | example: `194`
      - `item_group_id` (`number`) - Item Group ID | example: `576`
      - `item_code` (`string`) - Item Code | example: `EIN30`
      - `item_name` (`string`) - Item Name | example: `KAOS POLOS COTTON COMBED 20S`
      - `buy_price` (`string`) - Buy price of item | example: `40000.0000`
      - `is_consignment` (`boolean`) - Whether the item is a consignment or not | example: `False`
      - `buy_unit` (`string`) - Buy Unit | example: `Buah`
      - `account_code` (`string`) - Account Code | example: `1-1200`
      - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`
      - `uom_id` (`number`) - Unit of Measure ID. Default value is -1 | example: `-1`
      - `invt_acct_id` (`number`) - Inventory Account ID (default = 4) | example: `4`
      - `brand_name` (`string`) - Brand Name
      - `item_full_name` (`string`) - Item Full Name | example: `EIN30 - KAOS POLOS COTTON COMBED 20S - sage green, M`
      - `coalesce` (`string`) | example: `40000.000000000000`
      - `average_cost` (`string`) - Average Cost | example: `40000.000000000000`
      - `end_qty` (`number`) - Total Inventory on Hand | example: `0`
      - `available_qty` (`number`) - End qty | example: `0`
  - `totalCount` (`number`) - Total Count of All Items

### Schema: `getSalesReturnSetting`

- **Type**: `object`
- **Properties** (1):
  - `sales_return` (`boolean`) - If "true," Jubelio will take into account any prices, discounts, or other charges that are listed on the sales order invoice if there is a sales retur | example: `sales`

### Schema: `postSalesReturnSetting`

- **Type**: `object`
- **Properties** (1):
  - `sales_return` (`boolean`) - If "true," Jubelio will take into account any prices, discounts, or other charges that are listed on the sales order invoice if there is a sales retur | example: `sales`

### Schema: `responseSalesReturnSetting`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `ok`

### Schema: `getDefaultBinResponse`

- **Type**: `object`
- **Properties** (3):
  - `bin_id` (`string`) - Bin ID | example: `3`
  - `location_id` (`string`) - Location ID | example: `1`
  - `bin_final_code` (`string`) - Complete Rack Code | example: `LX-BX-KX-R1`

### Schema: `getWMSCourierResponse`

- **Type**: `array`
- **Item properties** (2):
  - `courier_id` (`number`) - Courier ID | example: `4`
  - `courier_name` (`string`) - Courier Name | example: `AnterAja`

### Schema: `getWMSSalesShipmentsCourierNewIdResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (2):
      - `shipment_date` (`string`) - Shipment Date | example: `2022-01-29T10:59:44.525Z`
      - `shipments` (`array of object`)
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesShipmentsInstantAllResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (2):
      - `shipment_date` (`string`) - Shipment Date | example: `2022-01-29T10:59:44.525Z`
      - `shipments` (`array of object`)
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `postWMSScanShipmentRequest`

- **Type**: `object`
- **Required fields**: `shipment_no`
- **Properties** (1):
  - `shipment_no` (`string`) - Shipment No. | example: `SHP-000010492`

### Schema: `postWMSScanShipmentResponse`

- **Type**: `object`
- **Properties** (14):
  - `shipment_header_id` (`number`) - Shipment Header ID | example: `10492`
  - `shipment_no` (`string`) - Shipment No. | example: `SHP-000010492`
  - `courier_id` (`number`) - Courier ID | example: `1`
  - `transaction_date` (`string`) | example: `2022-02-24T09:19:29.029Z`
  - `location_id` (`number`) - Location ID | example: `8`
  - `note` (`string`) - note
  - `shipment_type` (`string`) - Shipment Type | example: `2`
  - `shipment_date` (`string`) - Shipment Date | example: `2022-02-25T09:19:16.763Z`
  - `is_completed` (`boolean`)
  - `employee_id` (`string`) - Employee ID | example: `ririn@staffgudang.com`
  - `courier_new_id` (`number`) | example: `1`
  - `completed_date` (`string`)
  - `courier_name` (`string`) - Courier Name | example: `JNE`
  - `type` (`string`) | example: `standard`

### Schema: `postWMSShipmentsRequest`

- **Type**: `object`
- **Required fields**: `courier_new_id`, `location_id`, `shipment_type`, `shipment_header_id`, `shipment_no`, `courier_name`, `shipment_date`
- **Properties** (7):
  - `courier_new_id` (`number`) - Courier New ID | example: `4`
  - `location_id` (`number`) - Location ID | example: `1`
  - `shipment_type` (`string`) - Shipment Type | example: `2`
  - `shipment_header_id` (`number`) - Shipment Header ID. to create, set as 0. | example: `0`
  - `shipment_no` (`string`) - Shipment No. | example: `[auto]`
  - `courier_name` (`string`) - Courier Name | example: `AnterAja`
  - `shipment_date` (`string`) - Shipment Date | example: `2022-02-25T08:45:31.575Z`

### Schema: `postWMSShipmentsResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `ok`

### Schema: `postWMSSalesPicklistsChangePickerRequest`

- **Type**: `object`
- **Required fields**: `ids`, `employee_id`
- **Properties** (2):
  - `ids` (`array of number`)
  - `employee_id` (`string`) - Employee ID | example: `ririn@staffgudang.com`

### Schema: `postWMSSalesPicklistsChangePickerResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) | example: `ok`
  - `invalidPick` (`array of object`)

### Schema: `postWMSShipmentDetailRequest`

- **Type**: `object`
- **Required fields**: `shipment_header_id`, `salesorder_id`, `employee_id`
- **Properties** (3):
  - `shipment_header_id` (`number`) - Shipment Header ID | example: `10487`
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499885`
  - `employee_id` (`string`) - Employee Email | example: `ririn@staffgudang.com`

### Schema: `postWMSShipmentDetailResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) | example: `ok`

### Schema: `postWMSShipmentsInstantCourierRequest`

- **Type**: `object`
- **Required fields**: `ids`, `employee_id`
- **Properties** (2):
  - `ids` (`array of object`)
  - `employee_id` (`string`) - Employee ID | example: `ririn@staffgudang.com`

### Schema: `postWMSShipmentsInstantCourierResponse`

- **Type**: `array`
- **Item properties** (21):
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499678`
  - `shipment_header_id` (`number`) - Shipment Header ID
  - `salesorder_no` (`string`) - Sales Order No. | example: `TP-INV/20210924/MPL/1614552410`
  - `shipment_no` (`string`) - Shipment No.
  - `transaction_date` (`string`) - Transaction Date | example: `2021-09-24T07:59:47.000Z`
  - `source` (`number`) - Source | example: `128`
  - `channel_status` (`string`) - Channel Status | example: `450`
  - `internal_status` (`string`) - Internal Status | example: `PROCESSING`
  - `shipment_date` (`string`) - Shipment Date | example: `2022-02-23T10:16:41.640Z`
  - `shipping_full_name` (`string`) - Shipping Full Name | example: `Junaedi`
  - `location_id` (`number`) - Location ID | example: `1`
  - `shipping_full_address` (`string`) - Shipping Full Address | example: `Perum. Galaxy Bumi Permai L5/12A Sukolilo Kota Surabaya Jawa Timur 60119`
  - `tracking_no` (`string`) - Tracking No.
  - `ticket_no` (`string`) - Ticket No.
  - `shipper` (`string`) - Shipper | example: `GoSend Instant Courier`
  - `marketplace_status` (`string`) - Marketplace Status | example: `Pesanan dengan instant courier, langsung panggil driver di tab pengiriman`
  - `courier_id` (`number`) - Courier ID
  - `shipment_type` (`string`) - Shipment Type
  - `store_id` (`string`) - Store ID | example: `5636`
  - `district_cd` (`number`) - district code
  - `label_printed_count` (`number`) | example: `2`

### Schema: `getWMSSalesOrdersReadyToPickResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Sales Orders that are ready to pick
    - **Array item properties** (28):
      - `salesorder_id` (`number`) - Sales Order ID | example: `249913`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499913`
      - `transaction_date` (`string`) - Transaction Date | example: `2022-02-22T03:33:26.024Z`
      - `note` (`string`) - Note
      - `contact_id` (`number`) - Contact ID | example: `2034362`
      - `customer_name` (`string`) - Customer Name | example: `Deni Gentong`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `shipper` (`string`) - Shipper | example: `Grab Instant`
      - `source` (`number`) - Source | example: `1`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `store_id` (`string`) - Store ID
      - `dropshipper` (`string`) - Dropshipper | example: `Toko Sejahtera`
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty` (`number`)
      - `due_date` (`number`) - Due Date | example: `0`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `total_qty` (`number`) - Total Quantity | example: `100`
      - `is_po` (`boolean`)
      - `is_instant_courier` (`boolean`) | example: `False`
      - `label_printed_count` (`number`) | example: `2`
      - `b_tracking_no` (`boolean`) | example: `true|`
      - `awb_printed_count` (`number`) | example: `2`
      - `status_details` (`string`) - Status Detail
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `tracking_number` (`string`) - Tracking Number
      - `tracking_no` (`string`) - Tracking Number
      - `district_cd` (`string`) - District Code | example: `CGK01`
      - `channel_status` (`string`) - Channel Status | example: `Paid`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesShipmentsCompletedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (2):
      - `shipment_date` (`string`) | example: `09:16 - 12 Mar 2022`
      - `shipments` (`array of object`)
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesShippedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (16):
      - `salesorder_id` (`number`) - Sales Order ID | example: `191`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-000000191`
      - `transaction_date` (`string`) - Transaction Date | example: `2021-12-17T04:54:10.068Z`
      - `order_created_date` (`string`) - Order Created Date. | example: `2021-12-17T04:54:10.068Z`
      - `shipment_header_id` (`number`) - Shipment Header ID | example: `106`
      - `total_weight_in_kg` (`number`) - Total Weight | example: `2`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `channel_status` (`string`) - Channel Status | example: `Shipped`
      - `shipment_no` (`string`) - Shipment No. | example: `SHP-000000106`
      - `shipment_date` (`string`) - Shipment Date | example: `2022-01-12T02:26:45.554Z`
      - `courier_name` (`string`) - Courier Name | example: `J&T`
      - `employee_name` (`string`) - Employee Name | example: `Ririn`
      - `shipment_detail_id` (`number`) | example: `96`
      - `customer_name` (`string`) | example: `Zilingo`
      - `source_name` (`string`) | example: `INTERNAL`
      - `tracking_number` (`number`) | example: `123`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getSalesOrdersEmptyStockResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (29):
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499930`
      - `shipper` (`string`) - Shipper
      - `stock_status` (`number`) - Stock Status | example: `1`
      - `dropshipper` (`string`) - Dropshipper
      - `location_id` (`number`) - Location ID | example: `1`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499930`
      - `c_salesorder_no` (`string`) | example: `SO-002499930`
      - `transaction_date` (`string`) - Transaction Date | example: `2022-02-22T03:33:26.024Z`
      - `note` (`string`) - Note
      - `customer_name` (`string`) - Customer Name | example: `Deni Gentong`
      - `created_date` (`string`) - Created Date | example: `2022-03-16T02:29:39.968Z`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `due_date` (`number`) - Due Date | example: `0`
      - `internal_do_number` (`string`)
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `is_po` (`boolean`)
      - `is_instant_courier` (`boolean`) | example: `False`
      - `label_printed_count` (`number`) | example: `2`
      - `internal_so_number` (`string`)
      - `is_label_printed` (`boolean`)
      - `picked_in` (`string`)
      - `deleted_from_picklist_by` (`string`)
      - `shipment_type` (`string`)
      - `status_details` (`string`)
      - `package_count` (`number`) | example: `1`
      - `total_qty` (`number`) | example: `10`
      - `channel_status` (`string`) | example: `Paid`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesPicklistsConfirmPickResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Sales Orders that are on picking process
    - **Array item properties** (28):
      - `picklist_id` (`number`) - Picklist ID | example: `32455`
      - `picklist_no` (`string`) - Picklist Number | example: `PICK-000032455`
      - `b_picklist_no` (`string`) | example: `PICK-000032455 *|contain invalid orders|1`
      - `b_salesorder_no` (`string`) | example: `false|LZ-695761768601247-3239|`
      - `status` (`string`) - Status | example: `Dalam Proses`
      - `salesorder_no` (`string`) - Sales Order No. | example: `LZ-695761768601247-3239`
      - `status_details` (`string`) | example: `pending`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499178`
      - `source` (`number`) - Source | example: `4`
      - `store_id` (`string`) - Store ID | example: `3239`
      - `source_name` (`string`) | example: `LAZADA`
      - `store_name` (`number`) | example: `LAZADA - INDOBABY`
      - `transaction_date` (`string`) - Transaction Date | example: `2021-09-24T08:11:08.000Z`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `customer_name` (`string`) - Customer Name | example: `Lilis Karlina`
      - `serial_number` (`string`) - Serial Number
      - `shipper` (`string`) - Shipper | example: `LEX MP`
      - `due_date` (`number`) - Due Date | example: `0`
      - `is_instant_courier` (`boolean`) | example: `False`
      - `label_printed_count` (`number`) | example: `2`
      - `shipment_type` (`string`) - Shipment Type
      - `package_count` (`number`) - Package Count | example: `2`
      - `to_no` (`number`) - Total Quantity to Pick | example: `10`
      - `from_no` (`number`) - Quantity Items that already picked | example: `0`
      - `total_salesorder` (`number`) - Total Sales Order | example: `4`
      - `picker_name` (`string`) - Picker Name | example: `Avi`
      - `duration` (`string`) | example: `1498 menit`
      - `percentage` (`number`) - Picking Process Percentage | example: `0`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesShipmentsAllResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (2):
      - `shipment_date` (`string`) - Shipment Date | example: `2022-01-29T10:59:44.525Z`
      - `shipments` (`array of object`)
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesOrderReadyToShipResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of sales orders that are finish picking.
    - **Array item properties** (26):
      - `salesorder_id` (`number`) - Sales Order ID | example: `249913`
      - `channel_status` (`string`) - Channel Status | example: `Processing`
      - `sub_status` (`string`) - Sub Status. For blibli order validation requirements.
      - `tracking_number` (`string`) - Tracking Number | example: `CM4832957234`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499913`
      - `transaction_date` (`string`) - Transaction Date | example: `2022-02-22T03:33:26.024Z`
      - `note` (`string`) - Note
      - `contact_id` (`number`) - Contact ID | example: `2034362`
      - `customer_name` (`string`) - Customer Name | example: `Deni Gentong`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `shipper` (`string`) - Shipper | example: `Grab Instant`
      - `source_name` (`string`) - Source Name | example: `Internal`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `store_id` (`string`) - Store ID
      - `dropshipper` (`string`) - Dropshipper | example: `Toko Sejahtera`
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty` (`number`)
      - `due_date` (`number`) - Due Date | example: `0`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `total_qty` (`number`) - Total Quantity | example: `100`
      - `invoice_no` (`string`) - Invoice No. | example: `INV-002237402`
      - `ship_address` (`string`) - Shipping Address | example: `Desa Batang Warak`
      - `tracking_no` (`string`) - Tracking Number
      - `picklist_id` (`number`) - Picklist ID | example: `32369`
      - `picklist_no` (`string`) - Picklist No. | example: `PICK-000032369`
      - `packlist_id` (`number`) - Packlist ID | example: `12`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesPacklistFinishPackResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (31):
      - `salesorder_id` (`number`) - Sales Order ID | example: `117`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-000000117`
      - `customer_name` (`string`) - Customer Name | example: `Lilis Karlina`
      - `contact_id` (`number`) - Contact ID | example: `2342173`
      - `source` (`number`) - Source | example: `1`
      - `label_printed_count` (`number`) - To describe the number of times the shipping label is printed. | example: `2`
      - `channel_status` (`string`) - Channel Status | example: `Processing`
      - `invoice_no` (`string`) - Invoice Number | example: `INV-002237550`
      - `packer_id` (`string`) - Packer ID | example: `2`
      - `transaction_date` (`string`) - Transaction Date | example: `2021-07-24T09:04:24.070Z`
      - `created_date` (`string`) - Created Date | example: `2021-07-24T09:04:24.070Z`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `shipper` (`string`) - Shipper | example: `JNE REG`
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `store_id` (`string`) - Store ID
      - `dropshipper` (`string`) - Dropshipper
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty` (`number`) - Quantity
      - `due_date` (`number`) - Due Date | example: `0`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `is_cod` (`boolean`)
      - `total_weight_in_kg` (`number`) | example: `10`
      - `total_qty` (`number`) | example: `10`
      - `tracking_no` (`string`)
      - `note` (`string`) - Note
      - `b_tracking_no` (`boolean`) | example: `True`
      - `tracking_number` (`string`)
      - `packlist_id` (`number`) - Picklist ID | example: `12466`
      - `packlist_no` (`string`) - Packlist No. | example: `PACK-000000009`
      - `packer` (`string`) - Packer Name | example: `Ririn`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesPacklistVerifySalesOrderResponse`

- **Type**: `object`
- **Properties** (10):
  - `salesorder_id` (`number`) - Sales Order ID | example: `2297702`
  - `salesorder_no` (`string`) - Sales Order No | example: `SO-002297702`
  - `is_canceled` (`boolean`) - Whether SO is canceled | example: `False`
  - `internal_status` (`string`) - Internal status | example: `PROCESSING`
  - `is_acknowledge` (`boolean`) - Is acknowledge | example: `True`
  - `acknowledge_status` (`string`) - Acknowledge status
  - `packages` (`string`) - Packages
  - `package_count` (`number`) - Package count | example: `1`
  - `source` (`number`) - Source | example: `1`
  - `wms_status` (`string`) - WMS Status | example: `FINISH_PICK`

### Schema: `postWMSSalesReadyToProcessRequest`

- **Type**: `object`
- **Required fields**: `salesorder_ids`
- **Properties** (1):
  - `salesorder_ids` (`array of object`)

### Schema: `postWMSSalesReadyToProcessResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`number`) | example: `150`

### Schema: `postWMSSalesShipmentsOrdersRequest`

- **Type**: `object`
- **Required fields**: `ids`
- **Properties** (1):
  - `ids` (`array of number`)

### Schema: `postWMSSalesShipmentsOrdersResponse`

- **Type**: `array`
- **Item properties** (21):
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499678`
  - `shipment_header_id` (`number`) - Shipment Header ID
  - `salesorder_no` (`string`) - Sales Order No. | example: `TP-INV/20210924/MPL/1614552410`
  - `shipment_no` (`string`) - Shipment No.
  - `transaction_date` (`string`) - Transaction Date | example: `2021-09-24T07:59:47.000Z`
  - `source` (`number`) - Source | example: `128`
  - `channel_status` (`string`) - Channel Status | example: `450`
  - `internal_status` (`string`) - Internal Status | example: `PROCESSING`
  - `shipment_date` (`string`) - Shipment Date | example: `2022-02-23T10:16:41.640Z`
  - `shipping_full_name` (`string`) - Shipping Full Name | example: `Junaedi`
  - `location_id` (`number`) - Location ID | example: `1`
  - `shipping_full_address` (`string`) - Shipping Full Address | example: `Perum. Galaxy Bumi Permai L5/12A Sukolilo Kota Surabaya Jawa Timur 60119`
  - `tracking_no` (`string`) - Tracking No.
  - `ticket_no` (`string`) - Ticket No.
  - `shipper` (`string`) - Shipper | example: `GoSend Instant Courier`
  - `marketplace_status` (`string`) - Marketplace Status | example: `Pesanan dengan instant courier, langsung panggil driver di tab pengiriman`
  - `courier_id` (`number`) - Courier ID
  - `shipment_type` (`string`) - Shipment Type
  - `store_id` (`string`) - Store ID | example: `5636`
  - `district_cd` (`number`) - district code
  - `label_printed_count` (`number`) | example: `2`

### Schema: `postWMSSalesReadyToPickRequest`

- **Type**: `object`
- **Required fields**: `salesorder_ids`
- **Properties** (1):
  - `salesorder_ids` (`array of number`)

### Schema: `postWMSSalesReadyToPickResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`number`) | example: `200`

### Schema: `getWMSSalesOrdersRequestCancelResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (25):
      - `salesorder_id` (`number`) - Sales Order ID | example: `117`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-000000117`
      - `customer_name` (`string`) - Customer Name | example: `Lilis Karlina`
      - `transaction_date` (`string`) - Transaction Date | example: `2021-07-24T09:04:24.070Z`
      - `created_date` (`string`) - Created Date | example: `2021-07-24T09:04:24.070Z`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `due_date` (`number`) - Due Date | example: `0`
      - `internal_do_number` (`string`)
      - `note` (`string`) - Note
      - `is_paid` (`boolean`) | example: `True`
      - `is_canceled` (`boolean`)
      - `picklist_id` (`number`) - Picklist ID | example: `12466`
      - `shipper` (`string`) - Shipper | example: `JNE REG`
      - `stock_status` (`number`) | example: `1`
      - `total_qty` (`number`) - Total Quantity | example: `20`
      - `dropshipper` (`string`) - Dropshipper
      - `internal_so_number` (`string`)
      - `is_label_printed` (`boolean`)
      - `picked_in` (`string`)
      - `deleted_from_picklist_by` (`string`)
      - `shipment_type` (`string`)
      - `status_details` (`string`)
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesOrdersFailedPickResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (16):
      - `salesorder_id` (`number`) - Sales Order ID | example: `117`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-000000117`
      - `transaction_date` (`string`) - Transaction Date | example: `2021-07-24T09:04:24.070Z`
      - `contact_id` (`number`) | example: `2`
      - `customer_name` (`string`) - Customer Name | example: `Lilis Karlina`
      - `grand_total` (`number`) - Grand Total | example: `120000`
      - `shipper` (`string`) - Shipper | example: `JNE REG`
      - `deleted_from_picklist_by` (`string`) | example: `ririn@staffgudang.com`
      - `store_name` (`string`) - Store Name | example: `WEBSTORE`
      - `dropshipper` (`string`) - Dropshipper
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty` (`number`) - Quantity
      - `due_date` (`number`) - Due Date | example: `0`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `total_qty` (`number`) - Total Quantity | example: `20`
      - `cancel_reason` (`array of object`)
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesOrdersFinishPickResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Sales Orders that are finish picking.
    - **Array item properties** (33):
      - `salesorder_id` (`number`) - Sales Order ID | example: `249913`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499913`
      - `transaction_date` (`string`) - Transaction Date | example: `2022-02-22T03:33:26.024Z`
      - `source` (`string`) - Sales Channel | example: `1`
      - `is_cod` (`boolean`) - Whether or not the COD method of payment is used. | example: `False`
      - `package_count` (`number`) - Total package to send | example: `1`
      - `packlist_id` (`string`) - Packlist ID
      - `invoice_no` (`string`) - Invoice Number | example: `INV-000000653`
      - `note` (`string`) - Note
      - `contact_id` (`number`) - Contact ID | example: `2034362`
      - `customer_name` (`string`) - Customer Name | example: `Deni Gentong`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `shipper` (`string`) - Shipper | example: `Grab Instant`
      - `source_name` (`string`) - Source Name | example: `Internal`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `store_id` (`string`) - Store ID
      - `dropshipper` (`string`) - Dropshipper | example: `Toko Sejahtera`
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty` (`number`)
      - `due_date` (`number`) - Due Date | example: `0`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `total_qty` (`number`) - Total Quantity | example: `100`
      - `is_po` (`boolean`)
      - `is_instant_courier` (`boolean`) | example: `False`
      - `label_printed_count` (`number`) | example: `2`
      - `b_tracking_no` (`boolean`) | example: `true|`
      - `awb_printed_count` (`number`) | example: `2`
      - `tracking_no` (`string`) - Tracking Number
      - `tracking_number` (`string`) - Tracking Number
      - `picklist_id` (`number`) - Picklist ID | example: `32369`
      - `picklist_no` (`string`) - Picklist No. | example: `PICK-000032369`
      - `picker` (`string`) - Picker Staff | example: `Ririn`
      - `channel_status` (`string`) - Channel Status | example: `Paid`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getSalesOrdersResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (38):
      - `salesorder_id` (`number`) - Sales Order ID | example: `6`
      - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000006`
      - `invoice_no` (`string`) - Invoice Number | example: `INV-000000222`
      - `invoice_created_date` (`string`) | example: `2022-03-08T16:20:17.892Z`
      - `shipping_full_name` (`string`) - Shipping Full Name (Receiver) | example: `Radit`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Pelanggan Umum`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
      - `location_name` (`string`) - Location Name | example: `Pusat`
      - `grand_total` (`string`) - Grand Total | example: `120000`
      - `channel_status` (`string`) - Channel Status | example: `Cancelled`
      - `internal_status` (`string`) - Internal Status | example: `CANCELLED`
      - `is_paid` (`boolean`) - Whether Purchase Order have been Paid | example: `True`
      - `is_canceled` (`boolean`) - Whether Purchase Order have been Canceled | example: `True`
      - `channel_name` (`string`) - Channel Name | example: `Tokopedia`
      - `store_name` (`string`) - Source Name | example: `Toko Bahagia`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `marked_as_complete` (`boolean`) - Whether Purchase Order have been completed | example: `False`
      - `store_id` (`string`) - Store ID | example: `1`
      - `channel_id` (`number`) - Channel ID | example: `1`
      - `internal_do_number` (`string`) - Internal DO Number
      - `internal_so_number` (`number`) - Internal SO Number
      - `awb_created_date` (`string`) - AWB Created date
      - `source` (`string`) - .
      - `store` (`string`) - Store Name
      - `shipment_type` (`string`) - Type of Shipment
      - `status_details` (`string`) - Status detail
      - `is_instant_courier` (`boolean`) | example: `False`
      - `is_po` (`boolean`)
      - `label_printed_count` (`number`)
      - `is_fbm` (`boolean`)
      - `last_modified` (`string`) | example: `2022-03-08T16:21:22.654Z`
      - `package_count` (`number`) | example: `1`
      - `cancel_reason` (`string`)
      - `cancel_reason_detail` (`string`)
      - `wms_status` (`string`) - WMS Status | example: `completed`
      - `note` (`string`)
      - `action` (`string`) | example: `COMPLETED`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `AssignStaffRequest`

- **Type**: `object`
- **Required fields**: `doing_by`, `data`
- **Properties** (2):
  - `data` (`array of object`) - List of Bill ID that needs to be putaway & location to placed the items.
    - **Array item properties** (4):
      - `location_id` (`string`) - Warehouse Location | example: `1`
      - `bill_id` (`array of number`)
      - `transfer_id` (`array of number`)
      - `return_id` (`array of number`)
  - `doing_by` (`string`) - Staff that will putaway items (Using employee id) | example: `ririn@staffgudang.com`

### Schema: `PutawayPostResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Response Status | example: `success`
  - `locationFailed` (`string`)

### Schema: `postWMSSalesPacklistUpdateQTYPackedRequest`

- **Type**: `object`
- **Required fields**: `packer_id`, `item_id`, `packlist_detail_id`, `packlist_id`, `qty_packed`, `salesorder_id`, `set_finish_all`
- **Properties** (7):
  - `packer_id` (`string`) - Email Packer Staff | example: `ririn@staffgudang.com`
  - `item_id` (`number`) - Item ID | example: `66253`
  - `packlist_detail_id` (`number`) - Packlist Detail ID | example: `12`
  - `packlist_id` (`number`) - Packlist ID | example: `9`
  - `qty_packed` (`number`) - Quantity Packed | example: `1`
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499885`
  - `set_finish_all` (`boolean`) - Set Finish All | example: `False`

### Schema: `postWMSSalesPacklistUpdateQTYPackedResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `ok`

### Schema: `postWMSSalesPacklistVerifyBarcode`

- **Type**: `object`
- **Required fields**: `packlist_id`, `salesorder_id`, `item_code`
- **Properties** (3):
  - `packlist_id` (`number`) - Packlist ID | example: `9`
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499885`
  - `item_code` (`string`) - Item Code | example: `BC90 - MERAH`

### Schema: `postWMSSalesPacklistVerifyBarcodeResponse`

- **Type**: `object`
- **Properties** (9):
  - `status` (`string`) - Status | example: `ok`
  - `packlist_id` (`number`) - Picklist ID | example: `4285`
  - `item_name` (`string`) - Item name | example: `Addison Jacket`
  - `barcode` (`string`) - Barcode | example: `padil-barcode`
  - `item_code` (`string`) - Item Code | example: `BC90 - MERAH`
  - `serial_no` (`string`) - Serial No
  - `batch_no` (`string`) - Batch No
  - `picklist_detail_id` (`number`) - Picklist detail ID | example: `17578`
  - `package_id` (`number`) - Package ID | example: `0`

### Schema: `postWMSSalesPacklistMarkAsCompleteRequest`

- **Type**: `object`
- **Required fields**: `ids`
- **Properties** (1):
  - `ids` (`array of number`)

### Schema: `postWMSSalesPacklistMarkAsCompleteResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `ok`

### Schema: `getWMSSalesPacklistsProcessResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (29):
      - `salesorder_id` (`number`) - Sales Order ID | example: `117`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-000000117`
      - `label_printed_count` (`number`) - To describe the number of times the shipping label is printed | example: `1`
      - `customer_name` (`string`) - Customer Name | example: `Lilis Karlina`
      - `contact_id` (`number`) - Contact ID | example: `2342173`
      - `source` (`number`) - Source | example: `1`
      - `transaction_date` (`string`) - Transaction Date | example: `2021-07-24T09:04:24.070Z`
      - `created_date` (`string`) - Created Date | example: `2021-07-24T09:04:24.070Z`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `shipper` (`string`) - Shipper | example: `JNE REG`
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `store_id` (`string`) - Store ID
      - `dropshipper` (`string`) - Dropshipper
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty` (`number`) - Quantity
      - `due_date` (`number`) - Due Date | example: `0`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `is_cod` (`boolean`)
      - `total_weight_in_kg` (`number`) | example: `10`
      - `total_qty` (`number`) | example: `10`
      - `tracking_no` (`string`)
      - `note` (`string`) - Note
      - `b_tracking_no` (`boolean`) | example: `True`
      - `tracking_number` (`string`)
      - `packlist_id` (`number`) - Picklist ID | example: `12466`
      - `packlist_no` (`string`) - Packlist No. | example: `PACK-000000009`
      - `packer_id` (`string`) - Email Packer Staff | example: `ririn@staffgudang.com`
      - `name` (`string`) - Packer Name | example: `Ririn`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getWMSSalesOrdersReadyToProcessResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (28):
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499930`
      - `shipper` (`string`) - Shipper
      - `stock_status` (`number`) - Stock Status | example: `1`
      - `dropshipper` (`string`) - Dropshipper
      - `location_id` (`number`) - Location ID | example: `1`
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499930`
      - `c_salesorder_no` (`string`) | example: `SO-002499930`
      - `transaction_date` (`string`) - Transaction Date | example: `2022-02-22T03:33:26.024Z`
      - `note` (`string`) - Note
      - `customer_name` (`string`) - Customer Name | example: `Deni Gentong`
      - `created_date` (`string`) - Created Date | example: `2022-03-16T02:29:39.968Z`
      - `grand_total` (`number`) - Grand Total | example: `130000`
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `store_name` (`string`) - store name | example: `INTERNAL`
      - `due_date` (`number`) - Due Date | example: `0`
      - `internal_do_number` (`string`)
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `is_po` (`boolean`)
      - `is_instant_courier` (`boolean`) | example: `False`
      - `label_printed_count` (`number`) | example: `2`
      - `internal_so_number` (`string`)
      - `is_label_printed` (`boolean`)
      - `picked_in` (`string`)
      - `deleted_from_picklist_by` (`string`)
      - `shipment_type` (`string`)
      - `status_details` (`string`)
      - `package_count` (`number`) | example: `1`
      - `total_qty` (`number`) | example: `10`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getAccountLookupResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (3):
      - `account_code` (`string`) - Account Code | example: `1-1000`
      - `account_id` (`number`) - Account Id | example: `1`
      - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getBlibliPickUpPoints`

- **Type**: `array`
- **Item properties** (2):
  - `id` (`string`) - Blibli location Id | example: `2`
  - `text` (`string`) - Blibli location name | example: `Pusat`

### Schema: `getCashbankReceivesResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (9):
      - `account_id` (`number`) - Account Id | example: `1`
      - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
      - `amount` (`string`) - Amount | example: `500000`
      - `contact_id` (`number`) - Contact Id | example: `1`
      - `contact_name` (`string`) - Contact Name | example: `PT. Name`
      - `doc_type` (`string`) - Doc Type | example: `Penerimaan`
      - `payment_id` (`number`) - Contact Id | example: `2260`
      - `payment_no` (`string`) - Payment Number | example: `REC-000000100`
      - `transaction_date` (`string`) - The transaction date | example: `2021-02-22T09:00:21.964Z`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getCashbankPaymentByIdResponse`

- **Type**: `object`
- **Properties** (11):
  - `accounts` (`array of object`) - List Items that exists in System
    - **Array item properties** (6):
      - `account_id` (`number`) - The account Id | example: `4`
      - `account_name` (`string`) - The account Name | example: `1-1200 - Persediaan Barang`
      - `credit` (`string`) - The credit | example: `0.0000`
      - `debit` (`string`) - Debit | example: `1000.0000`
      - `description` (`string`) - The description of the journal
      - `journal_detail_id` (`number`) - The journal detail Id | example: `21353`
  - `amount` (`string`) - Amount | example: `500000`
  - `cashbank_account_id` (`number`) - Cashbank Account Id | example: `2`
  - `cashbank_account_name` (`string`) - Cashbank Account Number | example: `1-1001 - Bank`
  - `contact_id` (`number`) - Contact Id | example: `2`
  - `contact_name` (`string`) - Contact Name | example: `PT. Name`
  - `note` (`string`) - Note
  - `payment_id` (`number`) - Contact Id | example: `2260`
  - `payment_no` (`string`) - Payment Number | example: `REC-000000100`
  - `payment_type` (`number`) - Payment Type | example: `4`
  - `transaction_date` (`string`) - The transaction date | example: `2020-07-24T07:33:46.357Z`

### Schema: `getCashbankReceiveByIdResponse`

- **Type**: `object`
- **Properties** (11):
  - `accounts` (`array of object`) - List Items that exists in System
    - **Array item properties** (6):
      - `account_id` (`number`) - The account Id | example: `4`
      - `account_name` (`string`) - The account Name | example: `1-1200 - Persediaan Barang`
      - `credit` (`string`) - The credit | example: `0.0000`
      - `debit` (`string`) - Debit | example: `1000.0000`
      - `description` (`string`) - The description of the journal
      - `journal_detail_id` (`number`) - The journal detail Id | example: `21353`
  - `amount` (`string`) - Amount | example: `500000`
  - `cashbank_account_id` (`number`) - Cashbank Account Id | example: `2`
  - `cashbank_account_name` (`string`) - Cashbank Account Number | example: `1-1001 - Bank`
  - `contact_id` (`number`) - Contact Id | example: `2`
  - `contact_name` (`string`) - Contact Name | example: `PT. Name`
  - `note` (`string`) - Note
  - `payment_id` (`number`) - Contact Id | example: `2260`
  - `payment_no` (`string`) - Payment Number | example: `REC-000000100`
  - `payment_type` (`number`) - Payment Type | example: `4`
  - `transaction_date` (`string`) - The transaction date | example: `2020-07-24T07:33:46.357Z`

### Schema: `getContactCategoryResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (6):
      - `category_id` (`number`) - Category ID | example: `2`
      - `contact_name` (`string`) - Contact Name | example: `Radit`
      - `category_code` (`string`) - Category Code | example: `01`
      - `created_by` (`string`) - Created By | example: `support@jubelio.com`
      - `updated_by` (`string`) - Updated By | example: `support@jubelio.com`
      - `contact_type` (`number`) - Contact Type | example: `4`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getContactsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (29):
      - `contact_id` (`number`) - Contact ID | example: `2`
      - `contact_name` (`string`) - Contact Name | example: `Radit`
      - `contact_type` (`number`) - Contact Type [0 = Customer/1 = Vendor/2 = Customer and Vendor] | example: `0`
      - `primary_contact` (`string`) - Primary Contact Name | example: `Radit`
      - `contact_position` (`string`) - Contact Position | example: `Developer`
      - `email` (`string`) - Contact Email | example: `radit.developer@gmail.com`
      - `phone` (`string`) - Contact Phone Number | example: `82297772419`
      - `mobile` (`string`) - Contact Mobile Phone Number | example: `82297772419`
      - `fax` (`string`) - Contact Fax Number | example: `21547281`
      - `npwp` (`string`) - Contact NPWP Number | example: `1234567890`
      - `payment_term` (`number`) - Contact Payment Term [-1 = Cash/7 = 7 Days/15 = 15 Days/30 = 30 Days] | example: `-1`
      - `notes` (`string`) - Contact Note/Description | example: `Radit like to be late when doing payment`
      - `s_address` (`string`) - Shipping Full Address | example: `Duri Kosambi No 11`
      - `s_area` (`string`) - Shipping Address Area | example: `Cengkareng`
      - `s_city` (`string`) - Shipping Address City | example: `Jakarta Barat`
      - `s_province` (`string`) - Shipping Address Province | example: `DKI Jakarta`
      - `s_post_code` (`string`) - Shipping Address Post Code | example: `11750`
      - `b_address` (`string`) - Biling Full Address | example: `Duri Kosambi No 11`
      - `b_area` (`string`) - Biling Address Area | example: `Cengkareng`
      - `b_city` (`string`) - Biling Address City | example: `Jakarta Barat`
      - `b_province` (`string`) - Biling Address Province | example: `DKI Jakarta`
      - `b_post_code` (`string`) - Biling Address Post Code | example: `11750`
      - `location_id` (`number`) - Location ID | example: `-1`
      - `is_loyalty_member` (`boolean`) - Is Contact a Loyalty Member | example: `-1`
      - `b_sex` (`string`) - Contact Gender | example: `L`
      - `b_birthday` (`string`) - Contact Birthday | example: `2018-10-20T17:00:00.000Z`
      - `contact_full` (`string`) - Contact Full Information | example: `Radit - 082297772417 - radit.developer@gmail.com`
      - `is_dropshipper` (`boolean`) - Is dropshipper | example: `False`
      - `is_reseller` (`boolean`) - Is reseller | example: `False`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveContactRequest`

- **Type**: `object`
- **Required fields**: `contact_name`, `contact_type`
- **Properties** (45):
  - `contact_id` (`number`) - Contact ID <br>
To create new contact => "contact_id": 0 <br>
To edit contact => "contact_id": {contact_id}
 | example: `0`
  - `contact_name` (`string`) - Contact Name | example: `Radit`
  - `is_company` (`boolean`) - Whether the contact is company or not | example: `False`
  - `contact_type` (`number`) - Contact Type <br>
[0 = Customer], [1 = Vendor], [2 = Customer and Vendor]
 | example: `0`
  - `contact_source` (`string`) - Contact Source
  - `source_detail` (`string`) - Source Detail
  - `primary_contact` (`string`) - Primary Contact Name | example: `Radit`
  - `contact_position` (`string`) - Contact Position | example: `Developer`
  - `email` (`string`) - Contact Email | example: `radit.developer@gmail.com`
  - `phone` (`string`) - Contact Phone Number | example: `82297772419`
  - `mobile` (`string`) - Contact Mobile Phone Number | example: `82297772419`
  - `fax` (`string`) - Contact Fax Number | example: `21547281`
  - `s_address` (`string`) - Shipping Full Address | example: `Duri Kosambi No 11`
  - `s_subdistrict` (`string`) - Shipping Sub District | example: `Pulau Panggang`
  - `s_subdistrict_id` (`number`) - Shipping Sub District ID | example: `3101011001`
  - `s_area` (`string`) - Shipping Address Area | example: `Cengkareng`
  - `s_district_id` (`string`) - Shipping District ID | example: `310101`
  - `s_city` (`string`) - Shipping Address City | example: `Jakarta Barat`
  - `s_city_id` (`number`) - Shipping City ID | example: `3101`
  - `s_province` (`string`) - Shipping Address Province | example: `DKI Jakarta`
  - `s_province_id` (`number`) - Shipping Province ID | example: `31`
  - `s_post_code` (`string`) - Shipping Address Post Code | example: `11750`
  - `b_address` (`string`) - Biling Full Address | example: `Duri Kosambi No 11`
  - `b_subdistrict` (`string`) - Biling Sub District | example: `Pulau Panggang`
  - `b_subdistrict_id` (`number`) - Biling Sub District ID | example: `3101011001`
  - `b_area` (`string`) - Biling Address Area | example: `Cengkareng`
  - `b_district_id` (`number`) - Biling District ID | example: `310101`
  - `b_city` (`string`) - Biling Address City | example: `Jakarta Barat`
  - `b_city_id` (`string`) - Biling City ID | example: `3101`
  - `b_province` (`string`) - Biling Address Province | example: `DKI Jakarta`
  - `b_province_id` (`number`) - Biling Province ID | example: `31`
  - `b_post_code` (`string`) - Biling Address Post Code | example: `11750`
  - `npwp` (`string`) - Contact NPWP Number | example: `1234567890`
  - `nik` (`string`) - NIK Number
  - `notes` (`string`) - Contact Note/Description | example: `Radit like to be late when doing payment`
  - `payment_term` (`number`) - Contact Payment Term <br>
[-1 = Cash], [7 = 7 Days], [15 = 15 Days], [30 = 30 Days]
 | example: `-1`
  - `debt_acct_id` (`string`)
  - `is_reseller` (`boolean`) - Whether contact is reseller or not | example: `False`
  - `is_dropshipper` (`boolean`) - Whether contact is dropshipper or not | example: `False`
  - `category_id` (`number`) - Category IS | example: `-1`
  - `is_coordinate` (`string`) - Shipping Coordinate | example: `(-6.212614389943739,106.8208734)`
  - `nik_images` (`string`) - NIK images | example: `[]`
  - `country_id` (`number`) - Country ID | example: `45`
  - `dob` (`string`) - Dob
  - `npwp_images` (`string`) - NPWP images | example: `[]`

### Schema: `deleteOK`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - Delete Status | example: `ok`

### Schema: `getContactResponse`

- **Type**: `object`
- **Properties** (26):
  - `contact_id` (`number`) - Contact ID | example: `2`
  - `contact_name` (`string`) - Contact Name | example: `Radit`
  - `contact_type` (`number`) - Contact Type [0 = Customer/1 = Vendor/2 = Customer and Vendor] | example: `0`
  - `primary_contact` (`string`) - Primary Contact Name | example: `Radit`
  - `contact_position` (`string`) - Contact Position | example: `Developer`
  - `email` (`string`) - Contact Email | example: `radit.developer@gmail.com`
  - `phone` (`string`) - Contact Phone Number | example: `82297772419`
  - `mobile` (`string`) - Contact Mobile Phone Number | example: `82297772419`
  - `fax` (`string`) - Contact Fax Number | example: `21547281`
  - `npwp` (`string`) - Contact NPWP Number | example: `1234567890`
  - `payment_term` (`number`) - Contact Payment Term [-1 = Cash/7 = 7 Days/15 = 15 Days/30 = 30 Days] | example: `-1`
  - `notes` (`string`) - Contact Note/Description | example: `Radit like to be late when doing payment`
  - `s_address` (`string`) - Shipping Full Address | example: `Duri Kosambi No 11`
  - `s_area` (`string`) - Shipping Address Area | example: `Cengkareng`
  - `s_city` (`string`) - Shipping Address City | example: `Jakarta Barat`
  - `s_province` (`string`) - Shipping Address Province | example: `DKI Jakarta`
  - `s_post_code` (`string`) - Shipping Address Post Code | example: `11750`
  - `b_address` (`string`) - Biling Full Address | example: `Duri Kosambi No 11`
  - `b_area` (`string`) - Biling Address Area | example: `Cengkareng`
  - `b_city` (`string`) - Biling Address City | example: `Jakarta Barat`
  - `b_province` (`string`) - Biling Address Province | example: `DKI Jakarta`
  - `b_post_code` (`string`) - Biling Address Post Code | example: `11750`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `is_loyalty_member` (`boolean`) - Is Contact a Loyalty Member | example: `-1`
  - `b_sex` (`string`) - Contact Gender | example: `-1`
  - `b_birthday` (`string`) - Contact Birth Date | example: `2018-10-20T17:00:00.000Z`

### Schema: `getCouriersResponse`

- **Type**: `array`
- **Item properties** (2):
  - `courier_id` (`number`) - Courier ID | example: `5`
  - `courier_name` (`string`) - Courier Name | example: `Go-Send`

### Schema: `getCourierResponse`

- **Type**: `object`
- **Properties** (2):
  - `courier_id` (`number`) - Courier ID | example: `5`
  - `courier_name` (`string`) - Courier Name | example: `Go-Send`

### Schema: `getInventoryResponse`

- **Type**: `object`
- **Properties** (3):
  - `channels` (`array of object`)
    - **Array item properties** (4):
      - `channel_name` (`string`) - Channel Name | example: `Lazada`
      - `store_name` (`string`) - User Email in Marketplace | example: `lisa@dsadkf.com`
      - `store_id` (`string`) - Store ID | example: `38565`
      - `channel_id` (`number`) - Channel ID | example: `4`
  - `locations` (`array of object`)
    - **Array item properties** (2):
      - `location_id` (`string`) - Location ID | example: `1`
      - `location_name` (`string`) - Location Name | example: `Gudang Pusat`
  - `data` (`array of object`)
    - **Array item properties** (11):
      - `item_id` (`string`) - Item ID | example: `8`
      - `item_code` (`string`) - Item Code | example: `EYE-KOS-NAR-WAN-PINK`
      - `item_name` (`string`) - Item Name | example: `Eyeshadow Kosmetik NARS Wanita`
      - `item_group_id` (`string`) - Item Group ID | example: `9`
      - `is_bundle` (`boolean`) - Whether the product is bundle item | example: `False`
      - `variation_values` (`array of object`)
      - `brand_name` (`string`) - Brand Name
      - `average_cost` (`number`) - Average Cost
      - `location_stocks` (`array of object`)
      - `total_stocks` (`object`)
      - `thumbnail` (`string`)

### Schema: `postMergeCatalog`

- **Type**: `array`
- **Item properties** (4):
  - `item_id` (`string`) - Item ID | example: `17`
  - `item_group_source` (`string`) - Item Group ID (Parent Group) which will be merge | example: `16`
  - `item_group_id` (`string`) - New Item Group ID after merge | example: `16`
  - `is_master` (`boolean`) - If the item is going to be set as master product | example: `False`

### Schema: `postMergeCatalogResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `Successfully Update`

### Schema: `getInventoryPutawayAllResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Putaway ID with all type of progress status
    - **Array item properties** (16):
      - `putaway_id` (`string`) - Putaway ID | example: `151`
      - `putaway_no` (`string`) - Putaway Number | example: `PUT-000000151`
      - `start_date` (`string`) - Time when putaway process has started | example: `2022-02-14T09:13:38.416Z`
      - `complete_date` (`string`) - Time when putaway process has ended | example: `2022-02-14T09:13:38.416Z`
      - `note` (`string`)
      - `created_by` (`string`) - Employee ID | example: `ririn@staffgudang.com`
      - `doing_by` (`string`) - Employee who is doing the putaway process | example: `ririn@staffgudang.com`
      - `item_receive` (`string`) - Transaction ID (Which can be bill_id, transfer_id, return_id) | example: `BIL-000009706`
      - `location_id` (`number`) - Location ID | example: `11`
      - `from_no` (`number`) - Quantity of item that has been putaway already | example: `8`
      - `to_no` (`number`) - Total quantity of item that needs to be putaway | example: `8`
      - `percentage` (`number`) - Progress of putaway process in percentage | example: `100`
      - `button_msg` (`string`) | example: `Selesai`
      - `location_name` (`string`) - Warehouse Name | example: `VIVI_WMS`
      - `created_name` (`string`) | example: `RIRIN`
      - `doing_name` (`string`) | example: `RIRIN`
  - `totalCount` (`number`) - total count of all data | example: `110`

### Schema: `getInventoryPutawayNotStartResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Putaway ID that still not started
    - **Array item properties** (16):
      - `putaway_id` (`string`) - Putaway ID | example: `151`
      - `putaway_no` (`string`) - Putaway Number | example: `PUT-000000151`
      - `start_date` (`string`) - Time when putaway process has started | example: `2022-02-14T09:13:38.416Z`
      - `complete_date` (`string`) - Time when putaway process has ended
      - `note` (`string`)
      - `created_by` (`string`) - Employee ID | example: `ririn@staffgudang.com`
      - `doing_by` (`string`) - Employee who is doing the putaway process | example: `ririn@staffgudang.com`
      - `item_receive` (`string`) - Transaction ID (Which can be bill_id, transfer_id, return_id) | example: `BIL-000009706`
      - `location_id` (`number`) - Location ID | example: `11`
      - `from_no` (`number`) - Quantity of item that has been putaway already | example: `0`
      - `to_no` (`number`) - Total quantity of item that needs to be putaway | example: `10`
      - `percentage` (`number`) - Progress of putaway process in percentage | example: `0`
      - `button_msg` (`string`) | example: `mulai`
      - `location_name` (`string`) - Warehouse Name | example: `VIVI_WMS`
      - `created_name` (`string`) | example: `RIRIN`
      - `doing_name` (`string`) | example: `RIRIN`
  - `totalCount` (`number`) - total count of all data | example: `110`

### Schema: `getInventoryPutawayProcessedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Putaway ID that have been processed
    - **Array item properties** (16):
      - `putaway_id` (`string`) - Putaway ID | example: `151`
      - `putaway_no` (`string`) - Putaway Number | example: `PUT-000000151`
      - `start_date` (`string`) - Time when putaway process has started | example: `2022-02-14T09:13:38.416Z`
      - `complete_date` (`string`) - Time when putaway process has ended
      - `note` (`string`)
      - `created_by` (`string`) - Employee ID | example: `ririn@staffgudang.com`
      - `doing_by` (`string`) - Employee who is doing the putaway process | example: `ririn@staffgudang.com`
      - `item_receive` (`string`) - Transaction ID (Which can be bill_id, transfer_id, return_id) | example: `BIL-000009706`
      - `location_id` (`number`) - Location ID | example: `11`
      - `from_no` (`number`) - Quantity of item that has been putaway already | example: `8`
      - `to_no` (`number`) - Total quantity of item that needs to be putaway | example: `20`
      - `percentage` (`number`) - Progress of putaway process in percentage | example: `40`
      - `button_msg` (`string`) | example: `Lanjutkan`
      - `location_name` (`string`) - Warehouse Name | example: `VIVI_WMS`
      - `created_name` (`string`) | example: `RIRIN`
      - `doing_name` (`string`) | example: `RIRIN`
  - `totalCount` (`number`) - total count of all data | example: `110`

### Schema: `getInventoryPutawayCompleted`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Putaway ID that are done putaway
    - **Array item properties** (16):
      - `putaway_id` (`string`) - Putaway ID | example: `151`
      - `putaway_no` (`string`) - Putaway Number | example: `PUT-000000151`
      - `start_date` (`string`) - Time when putaway process has started | example: `2022-02-14T09:13:38.416Z`
      - `complete_date` (`string`) - Time when putaway process has ended | example: `2022-02-14T09:13:38.416Z`
      - `note` (`string`)
      - `created_by` (`string`) - Employee ID | example: `ririn@staffgudang.com`
      - `doing_by` (`string`) - Employee who is doing the putaway process | example: `ririn@staffgudang.com`
      - `item_receive` (`string`) - Transaction ID (Which can be bill_id, transfer_id, return_id) | example: `BIL-000009706`
      - `location_id` (`number`) - Location ID | example: `11`
      - `from_no` (`number`) - Quantity of item that has been putaway already | example: `8`
      - `to_no` (`number`) - Total quantity of item that needs to be putaway | example: `8`
      - `percentage` (`number`) - Progress of putaway process in percentage | example: `100`
      - `button_msg` (`string`) | example: `Selesai`
      - `location_name` (`string`) - Warehouse Name | example: `VIVI_WMS`
      - `created_name` (`string`) | example: `RIRIN`
      - `doing_name` (`string`) | example: `RIRIN`
  - `totalCount` (`number`) - total count of all data | example: `110`

### Schema: `getReceiveItemPutawayResponse`

- **Type**: `array`
- **Item properties** (7):
  - `item_id` (`string`) - Item ID | example: `57009`
  - `item_code` (`string`) - Item Code | example: `BC90 - MERAH`
  - `item_name` (`string`) - Item Name | example: `Celana Wanita Trendy`
  - `item_full_name` (`string`) - Item Full Name | example: `BC90 - Merah - Celana Wanita Trendy`
  - `available_qty` (`number`) | example: `5`
  - `item_group_id` (`string`) - Item Group ID | example: `9194`
  - `thumbnail` (`string`) | example: `https://jubelio.blob.core.windows.net/images/gfdsgfsdgfd`

### Schema: `getInventoryItemsToBuy`

- **Type**: `object`
- **Properties** (20):
  - `item_group_id` (`number`) - Item Group Id | example: `2642`
  - `item_id` (`number`) - Item ID | example: `1`
  - `item_code` (`string`) - Item Code/SKU | example: `AB10648607583`
  - `item_name` (`string`) - Item Name | example: `Addison Jacket`
  - `buy_price` (`number`) - buy Price | example: `2o.000`
  - `buy_unit` (`string`) - buy unit | example: `Buah`
  - `account_code` (`string`) - Account Code | example: `1-1200`
  - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`
  - `last_price_receive` (`number`) - Last price receive | example: `0`
  - `buy_tax_id` - Buy tax for the items | example: `1`
  - `rate` (`string`) - Rate | example: `0`
  - `tax_name` (`string`) - Tax Name | example: `No Tax`
  - `acct_id` (`number`) | example: `0`
  - `uom_id` (`number`) - Uom ID | example: `-1`
  - `item_full_name` (`string`) - Item Full Name | example: `DYSW351-Addison Jacket`
  - `use_serial_number` (`boolean`) | example: `False`
  - `use_batch_number` (`boolean`) | example: `False`
  - `is_consignment` (`boolean`) | example: `False`
  - `average_cost` (`number`)
  - `thumbnail` (`string`) - Item Thumbnail | example: `https://jubelio.blob.core.windows.net/images/0swqgtzyqwoti4bwbawsvq/b0071d5448c2`

### Schema: `getInventoryActivityResponse`

- **Type**: `object`
- **Properties** (4):
  - `activities` (`array of object`) - List Location that exists in System
    - **Array item properties** (13):
      - `item_id` (`number`) - Item ID | example: `1`
      - `item_name` (`string`) - Item Name | example: `Barang 1`
      - `item_code` (`string`) - Item Name | example: `BAR-1`
      - `location_id` (`number`) - Location ID | example: `-1`
      - `location_name` (`string`) - Location Name | example: `Pusat`
      - `ref_no` (`string`) - Reference Number
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `created_date` (`string`) - Adjustment Created Date | example: `2018-10-20T17:00:00.000Z`
      - `trx_no` (`string`) - Transaction Number | example: `ADJ-000000331`
      - `source` (`string`) - Source of transaction | example: `ADJUSMENT`
      - `qty` (`string`) - Quantity that is used in transaction | example: `1`
      - `balance` (`string`) - Balance or Current Quantity (Sisa) | example: `2557`
      - `description` (`string`) - Description
  - `location_stocks` (`array of object`) - List Stocks of Inventory  for every Locations
  - `row_count` (`number`) - total row | example: `10`
  - `total_stock` (`string`) - Total Stock | example: `2577`

### Schema: `getAllStockAdjustmentsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (12):
      - `item_adj_id` (`number`) - Adjustment ID | example: `-1`
      - `item_adj_no` (`string`) - Adjustment Number | example: `_ADJ-BB_`
      - `transaction_date` (`string`) - Adjustment Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `created_date` (`string`) - Adjustment Created Date | example: `2018-10-20T17:00:00.000Z`
      - `note` (`string`) - Adjustment Note | example: `Saldo Awal Persediaan`
      - `is_opening_balance` (`boolean`) - Is Adjustment an Opening Balance | example: `True`
      - `location_id` (`number`) - Adjustment Location | example: `-1`
      - `created_by` (`string`) - User that create Adjustment | example: `Saldo Awal Persediaan`
      - `location_name` (`string`) - Adjustment Location Name | example: `Pusat`
      - `adjustment_type` (`string`) - Adjustment type
      - `is_warehouse` (`boolean`) - Is the location a warehouse | example: `True`
      - `is_from_opname` (`boolean`) | example: `False`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `item`

- **Type**: `object`
- **Required fields**: `amount`, `account_id`, `unit`, `cost`, `qty_in_base`, `item_adj_detail_id`, `item_id`, `bin_id`
- **Properties** (14):
  - `item_adj_detail_id` (`number`) - Adjustment Detail ID [0 = create] | example: `0`
  - `item_id` (`number`) - Item Adjustment ID | example: `1`
  - `description` (`string`) - Item Description | example: `Item Example Description`
  - `serial_no` (`string`) - Serial Number | example: `S000121`
  - `batch_no` (`string`) - Batch number
  - `qty_in_base` (`number`) - Item quantity to adjust. For example, set value as 10 if you want to add 10 items, or you can set -5 if you want to reduce your stock items as much as | example: `5`
  - `original_item_adj_detail_id` (`number`) - Original Item Adjustment Detail ID [0 = create] | example: `0`
  - `unit` (`string`) - Unit Name | example: `Buah`
  - `amount` (`number`) - qty_in_base multiplied with cost | example: `100000`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `account_id` (`number`) - User Account that do the Adjustment [default is 75] | example: `75`
  - `expired_date` (`string`)
  - `bin_id` (`number`) - Bin ID | example: `25`
  - `cost` (`number`) - Item Cost/Price. | example: `2747`

### Schema: `items`

- **Type**: `array`
- **Items**: ref `item`

### Schema: `adjusmentRequest`

- **Type**: `object`
- **Required fields**: `item_adj_id`, `is_opening_balance - item_adj_no - location_id - transaction_date - is_opening_balance - items`
- **Properties** (7):
  - `item_adj_id` (`number`) - Adjustment ID <br>
To create new adjustment => "item_adj_id": 0 <br>
To edit adjustment => "item_adj_id": {item_adj_id}
 | example: `0`
  - `item_adj_no` (`string`) - Adjustment Number <br>
To create new adjustment => "item_adj_no": "[auto]" <br>
To edit adjustment => "item_adj_no": {item_adj_no}
 | example: `[auto]`
  - `transaction_date` (`string`) - Adjustment Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `note` (`string`) - Adjustment Note | example: `Saldo Awal Persediaan`
  - `location_id` (`number`) - Adjustment Location | example: `-1`
  - `is_opening_balance` (`boolean`) - Is Adjustment an Opening Balance | example: `False`
  - `items` (ref: `items`)

### Schema: `saveOK`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Save Status | example: `ok`
  - `id` (`number`) - Object ID | example: `1`

### Schema: `getStockAdjustmentResponse`

- **Type**: `object`
- **Properties** (10):
  - `item_adj_id` (`number`) - Adjustment ID | example: `-1`
  - `item_adj_no` (`string`) - Adjustment Number | example: `_ADJ-BB_`
  - `transaction_date` (`string`) - Adjustment Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `created_date` (`string`) - Adjustment Created Date | example: `2018-10-20T17:00:00.000Z`
  - `note` (`string`) - Adjustment Note | example: `Saldo Awal Persediaan`
  - `is_opening_balance` (`boolean`) - Is Adjustment an Opening Balance | example: `True`
  - `location_id` (`number`) - Adjustment Location | example: `-1`
  - `created_by` (`string`) - User that create Adjustment | example: `Saldo Awal Persediaan`
  - `location_name` (`string`) - Adjustment Location Name | example: `Pusat`
  - `items` (`array of object`) - List Adjustment Items
    - **Array item properties** (15):
      - `item_adj_detail_id` (`number`) - Adjustment Detail ID | example: `1`
      - `item_id` (`number`) - Item Adjustment ID | example: `1`
      - `serial_no` (`string`) - Serial Number | example: `S000121`
      - `qty` (`string`) - Item Quantity | example: `0`
      - `qty_in_base` (`string`) - Item Quantity that will be add | example: `3`
      - `uom_id` (`number`) - Unit of Measure ID | example: `1`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `cost` (`string`) - Item Cost | example: `75000`
      - `amount` (`string`) - Total Item Costs | example: `225000`
      - `account_id` (`number`) - Account ID | example: `75`
      - `account_code` (`string`) - Account Code | example: `7-7004`
      - `item_full_name` (`string`) - Item Full Name | example: `BAR-1-HIT - Barang 1`
      - `account_name` (`string`) - Account Name | example: `7-7004 - Penyesuaian Persediaan Barang`
      - `average_cost` (`number`) - Average Cost | example: `75000`
      - `description` (`string`) - Item Description | example: `Item Example Description`

### Schema: `createProductRequest`

- **Type**: `object`
- **Required fields**: `item_group_id`, `item_group_name`, `uom_id`, `description`, `sell_this`, `sell_tax_id`, `buy_tax_id`, `sales_acct_id`, `cogs_acct_id`, `invt_acct_id`, `buy_this`, `stock_this`, `dropship_this`, `sell_unit`, `buy_unit`, `is_active`, `purch_acct_id`, `item_category_id`, `store_priority_qty_treshold`, `package_weight`, `sell_price`, `buy_price`, `brand_id`, `rop`, `use_single_image_set`, `use_serial_number`, `product_skus`
- **Properties** (40):
  - `item_group_id` (`number`) - Item Group ID <br>
To create new prouct => "item_group_id": 0 <br>
To edit prouct => "item_group_id": {item_group_id}
 | example: `0`
  - `item_group_name` (`string`) - Item Group Name (Unique)
 | example: `10.4 10W40`
  - `uom_id` (`number`) - Unit of Measure ID. Default value is -1 | example: `-1`
  - `description` (`string`) - Product Description. Please make sure the minimum length of your description is 30 characters. | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `sell_this` (`boolean`) - Whether the item can be sold. The default value is 'true'. | example: `True`
  - `buy_this` (`boolean`) - Whether the item can be bought to supplier. The default value is 'true'. | example: `True`
  - `stock_this` (`boolean`) - Whether the item can be stocked. The default value is 'true'. | example: `True`
  - `buy_price` (`number`) - Buy Price. You may set the value as 0. | example: `0`
  - `min` (`number`) - You can set 0 as the default value. | example: `0`
  - `max` (`number`) - You can set 0 as the default value. | example: `0`
  - `sell_price` (`number`) - Sell Price | example: `0`
  - `sell_tax_id` (`number`) - Sell Tax ID Default (PPN = -1, No PPN = 1) | example: `-1`
  - `sales_acct_id` (`number`) - Sales Account ID (default = 28) | example: `28`
  - `buy_tax_id` (`number`) - Buy Tax ID Default (PPN = -1, No PPN = 1) | example: `-1`
  - `invt_acct_id` (`number`) - Inventory Account ID (default = 4) | example: `4`
  - `cogs_acct_id` (`number`) - Cost of Goods Sold (COGS) Account Account ID (default = 30) | example: `30`
  - `purch_acct_id` (`number`) - Purchase Account ID (default = NULL)
  - `sell_unit` (`string`) - Sell Unit | example: `Buah`
  - `rop` (`number`) - Re-Order Point. Stock threshold where we need to adjust/update the stock. You may set the value as 0 if you don't have any threshold. | example: `20`
  - `lead_time` (`string`) - The time when receiving products from the supplier. | example: `0`
  - `item_category_id` (`number`) - Item Category ID. Using the API **Get All Categories**, you can find a suitable category for your products. | example: `454`
  - `store_priority_qty_treshold` (`number`) - Store Priority Treshold | example: `2`
  - `images` (`array of object`) - List item variations
    - **Array item properties** (4):
      - `url` (`string`) - Image URL | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `thumbnail` (`string`) - Image Thumbnail | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `file_name` (`string`) - Image Name | example: `fde755988e7d8931bea57bdb3c8a64e6`
      - `sequence_number` (`number`) - Image Sequence Number | example: `0`
  - `variation_images` (`array of object`) - List item variations
  - `use_serial_number` (`boolean`) - Whether the product use serial number | example: `False`
  - `use_batch_number` (`boolean`) - Whether the product use batch number | example: `False`
  - `brand_id` (`string`) - Brand ID. You may set the value as "null".
  - `dropship_this` (`boolean`) - Whether the item can be dropship | example: `False`
  - `is_active` (`boolean`) - You may set the value as "true" if the product is active for sale. | example: `True`
  - `package_content` (`string`) - Package content. You may set the value as null.
  - `package_weight` (`number`) - Package weight in gram. | example: `1000`
  - `package_height` (`number`) - Package height.
  - `package_width` (`number`) - Package width
  - `package_length` (`number`) - Package length
  - `variations` (`array of object`) - List Item Variations
  - `brand_name` (`string`) - Another Brand Name | example: `Adidas`
  - `product_skus` (`array of object`)
    - **Array item properties** (7):
      - `item_id` (`string`) - Item ID | example: `0`
      - `item_code` (`string`) - Item SKU, should be unique. | example: `RM-CHO-IJH`
      - `variation_values` (`array of object`)
      - `sell_price` (`number`) - Sell Price
      - `buy_price` (`number`) - Buy Price | example: `0`
      - `barcode` (`string`) - Barcode
      - `is_consignment` (`boolean`) - Whether the item is consignment item | example: `False`
  - `unlimited_stock_store_ids` (`number`) - The unlimited stock for selected store ids. <br>
Can be filled with "empty array" or "null".

  - `use_single_image_set` (`boolean`) - Whether the item use single image set. | example: `False`
  - `buy_unit` (`string`) | example: `Buah`

### Schema: `createSingleorMultiVariantProductRequest`

- **Type**: `object`
- **Required fields**: `item_group_id`, `item_group_name`, `uom_id`, `description`, `sell_this`, `sell_tax_id`, `buy_tax_id`, `sales_acct_id`, `cogs_acct_id`, `invt_acct_id`, `buy_this`, `stock_this`, `dropship_this`, `sell_unit`, `buy_unit`, `is_active`, `purch_acct_id`, `item_category_id`, `store_priority_qty_treshold`, `package_weight`, `variations`, `sell_price`, `buy_price`, `brand_id`, `rop`, `use_single_image_set`, `use_serial_number`, `product_skus`
- **Properties** (40):
  - `item_group_id` (`number`) - Item Group ID <br>
To create new prouct => "item_group_id": 0 <br>
To edit prouct => "item_group_id": {item_group_id}
 | example: `0`
  - `item_group_name` (`string`) - Item Group Name (Unique)
 | example: `10.4 10W40`
  - `uom_id` (`number`) - Unit of Measure ID. Default value is -1 | example: `-1`
  - `description` (`string`) - Item Description. Please make sure the minimum length for your description is 30 characters. | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `sell_this` (`boolean`) - Whether the item can be sold | example: `True`
  - `buy_this` (`boolean`) - Whether the item can be purchased from the supplier | example: `True`
  - `stock_this` (`boolean`) - Whether the item can be stocked | example: `True`
  - `buy_price` (`number`) - Buy Price | example: `0`
  - `min` (`number`) - You can set 0 as default value | example: `0`
  - `max` (`number`) - You can set 0 as default value | example: `0`
  - `sell_price` (`number`) - Sell Price | example: `0`
  - `sell_tax_id` (`number`) - Sell Tax ID Default (PPN = -1, No PPN = 1) | example: `-1`
  - `sales_acct_id` (`number`) - Sales Account ID (default = 28) | example: `28`
  - `buy_tax_id` (`number`) - Buy Tax ID Default (PPN = -1, No PPN = 1) | example: `-1`
  - `invt_acct_id` (`number`) - Inventory Account ID (default = 4) | example: `4`
  - `cogs_acct_id` (`number`) - Cost of Goods Sold (COGS) Account Account ID (default = 30) | example: `30`
  - `purch_acct_id` (`number`) - Purchase Account ID (default = NULL)
  - `sell_unit` (`string`) - Sell Unit | example: `Buah`
  - `rop` (`number`) - Re-Order Point. Stock limit that is used to decide when we need to adjust/update the stock. You may set the value as 0 if you don't have any stock thr | example: `20`
  - `lead_time` (`string`) - The time when receiving products from the supplier. | example: `0`
  - `item_category_id` (`number`) - Item Category ID. Using the API **Get All Categories**, you can find a suitable category for your products. | example: `454`
  - `store_priority_qty_treshold` (`number`) - Store Priority Treshold | example: `2`
  - `images` (`array of object`) - List Item Variations
    - **Array item properties** (4):
      - `url` (`string`) - Image URL | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `thumbnail` (`string`) - Image Thumbnail | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `file_name` (`string`) - Image Name | example: `fde755988e7d8931bea57bdb3c8a64e6`
      - `sequence_number` (`number`) - Image Sequence Number | example: `0`
  - `variation_images` (`array of object`) - List Item Variations
  - `use_serial_number` (`boolean`) - Whether the product use serial number | example: `False`
  - `use_batch_number` (`boolean`) - Whether the product use batch number | example: `False`
  - `brand_id` (`string`) - Brand ID. You may set the value as null.
  - `dropship_this` (`boolean`) - Whether the item can be dropship. | example: `False`
  - `is_active` (`boolean`) - Whether the item is active for sale. | example: `True`
  - `package_content` (`string`) - Package content.
  - `package_weight` (`number`) - Package weight in gram. | example: `1000`
  - `package_height` (`number`) - Package height.
  - `package_width` (`number`) - Package width.
  - `package_length` (`number`) - Package length.
  - `variations` (`array of object`) - List Item Variations
    - **Array item properties** (2):
      - `label` (`string`) - Variation Type | example: `Ukuran`
      - `values` (`array of string`)
  - `brand_name` (`string`) - Another Brand Name | example: `Adidas`
  - `product_skus` (`array of object`)
    - **Array item properties** (7):
      - `item_id` (`string`) - Item ID | example: `0`
      - `item_code` (`string`) - Item SKU, should be unique. | example: `RM-CHO-IJH`
      - `variation_values` (`array of object`)
      - `sell_price` (`number`) - Sell Price
      - `buy_price` (`number`) - Buy Price | example: `0`
      - `barcode` (`string`) - Barcode
      - `is_consignment` (`boolean`) - Whether the item is consignment item | example: `False`
  - `unlimited_stock_store_ids` (`number`) - The unlimited stock for selected store ids. <br>
Can be filled with "empty array" or "null".

  - `use_single_image_set` (`boolean`) - Whether the item use single image set. You may set the default value as "false" | example: `False`
  - `buy_unit` (`string`) | example: `Buah`

### Schema: `getItemCatalogResponse`

- **Type**: `object`
- **Properties** (53):
  - `item_group_id` (`number`) - Item Group ID | example: `2`
  - `item_group_name` (`string`) - Item Group Name | example: `10.4 10W40`
  - `description` (`string`) - Item Description | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `notes` (`string`) - Item Description | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `sell_tax_id` (`number`) - Sell Tax ID | example: `-1`
  - `buy_tax_id` (`number`) - Buy Tax ID | example: `-1`
  - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
  - `cogs_acct_id` (`number`) - Cost of Goods Sold (COGS) Account Account ID | example: `30`
  - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
  - `sell_this` (`boolean`) - Whether Item can be sell | example: `True`
  - `buy_this` (`boolean`) - Whether Item can be bought | example: `True`
  - `stock_this` (`boolean`) - Whether Item can be stock | example: `True`
  - `dropship_this` (`boolean`) - Whether Item can be drop ship | example: `False`
  - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
  - `sell_unit` (`string`) - Sell Unit | example: `Botol`
  - `buy_unit` (`string`) - Buy Unit | example: `Botol`
  - `is_active` (`boolean`) - Whether Item is active | example: `True`
  - `purch_acct_id` (`number`) - Purchase Account ID | example: `-1`
  - `status` (`number`) - Status | example: `null`
  - `item_category_id` (`number`) - Item Category ID | example: `454`
  - `package_content` (`string`) - Package Content | example: `Plastik and How to Use`
  - `package_weight` (`string`) - Package Weight | example: `1000`
  - `package_height` (`string`) - Package Height | example: `29`
  - `package_width` (`string`) - Package Width | example: `49`
  - `package_length` (`string`) - Package Length | example: `39.5`
  - `variations` (`array of object`) - List Item Variations
    - **Array item properties** (2):
      - `label` (`string`) - Variation Label | example: `color_family`
      - `values` (`array of string`) - List Variation Values
  - `sell_price` (`number`) - Item Sell Price | example: `3600000`
  - `buy_price` (`string`) - Item Buy Price | example: `1500000`
  - `last_modified` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
  - `brand_id` (`number`) - Brand ID | example: `11087`
  - `rop` (`number`) - Return of Purchase | example: `10`
  - `is_favourite` (`boolean`) - Whether Item a favourite | example: `False`
  - `use_single_image_set` (`boolean`) - Whether Item use Single Image Set | example: `False`
  - `use_serial_number` (`boolean`) - Whether Item use Serial Number | example: `True`
  - `brand_name` (`string`) - Another Brand Name | example: `Mikoooo`
  - `sell_tax_name` (`string`) - Sell Tax Name | example: `No Tax`
  - `buy_tax_name` (`string`) - Buy Tax Name | example: `No Tax`
  - `sales_acct_name` (`string`) - Sales Account Name | example: `4-4000 - Penjualan`
  - `invt_acct_name` (`string`) - Inventory Account Name | example: `1-1200 - Persediaan Barang`
  - `cogs_acct_name` (`string`) - Cost of Goods Sold (COGS) Account Name | example: `5-5000 - Harga Pokok Penjualan (COGS)`
  - `purch_acct_name` (`string`) - Purchase Account Name | example: `5-5000 - Harga Pokok Penjualan (COGS)`
  - `uom_name` (`string`) - Unit of Measure Name | example: `Buah`
  - `product_skus` (`array of object`) - List Item SKUs
    - **Array item properties** (10):
      - `item_id` (`number`) - Item ID | example: `2270`
      - `item_code` (`string`) - Item Code | example: `RIC-COO-MIY-RCM-PIN`
      - `sell_price` (`number`) - Item Sell Price Variant | example: `240000`
      - `end_qty` (`number`) - Total Inventory on Hand | example: `10`
      - `average_cost` (`number`) - Average Cost | example: `240000`
      - `amount` (`number`) - Amount | example: `240000`
      - `barcode` (`string`) - Barcode
      - `variation_values` (`array of object`) - Item Variations
      - `prices` (`array of object`) - List Price on Channels
      - `images` (`array of object`) - List Item Variations
  - `min` (`number`) - Minimal Item Purchase | example: `1`
  - `max` (`number`) - Maximal Item Purchase | example: `10`
  - `selected_brand_name` (`string`) - Selected Brand Name | example: `Miyako`
  - `bom_id` (`number`) - .
  - `store_priority_qty_treshold` (`number`) - Store priority Quantity
  - `created_date` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
  - `lead_time` (`string`) - Lead time
  - `is_po` (`boolean`) - Is ProOrder
  - `use_batch_number` (`boolean`) - .
  - `variation_images` (`array of object`) - List Item Variations
    - **Array item properties** (3):
      - `item_id` (`number`) - Item ID | example: `1`
      - `store_id` (`string`) - Store ID | example: `1`
      - `images` (`array of object`) - List Images

### Schema: `getProductListingResponse`

- **Type**: `object`
- **Properties** (17):
  - `store_id` (`string`) - Store ID | example: `1`
  - `channel_id` (`number`) - Channel ID | example: `2`
  - `item_group_id` (`number`) - Item Group ID | example: `10`
  - `mp_group_id` (`number`) - Marketplace Group ID | example: `1`
  - `sell_price` (`number`) - Sell Price | example: `20000000`
  - `item_group_name` (`number`) - Item Group Name | example: `1`
  - `brand_name` (`string`) - Brand Name | example: `ASUS ROG`
  - `description` (`string`) - Description | example: `<p>Laptop ROG</p>`
  - `package_length` (`number`) - Package Length | example: `100`
  - `package_width` (`number`) - Package Width | example: `100`
  - `package_height` (`number`) - Package Height | example: `100`
  - `package_weight` (`number`) - Package Weight | example: `100`
  - `package_content` (`string`) - Package Content | example: `Laptop`
  - `channel_category_id` (`number`) - Channel Category ID | example: `1`
  - `images` (`array of object`) - List Images
    - **Array item properties** (5):
      - `group_image_id` (`number`) - Group Image ID | example: `1`
      - `url` (`string`) - Image URL | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `thumbnail` (`string`) - Image Thumbnail | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `file_name` (`string`) - Image Name | example: `fde755988e7d8931bea57bdb3c8a64e6`
      - `sequence_number` (`number`) - Image Sequence Number | example: `0`
  - `variations` (`array of object`) - List Item Variations
    - **Array item properties** (10):
      - `item_id` (`number`) - Item ID | example: `1`
      - `channel_id` (`number`) - Channel ID | example: `1`
      - `store_id` (`string`) - Store ID | example: `20`
      - `channel_url` (`string`) - Channel URL | example: `https://www.bukalapak.com/p/category/xxxxx`
      - `channel_item_id` (`number`) - Channel Item ID | example: `1`
      - `channel_group_id` (`number`) - Channel Group ID | example: `2`
      - `sell_price` (`number`) - Sell Price | example: `20000000`
      - `item_code` (`string`) - Item Code | example: `SKU-001`
      - `variation_values` (`array of object`) - Item Variations
      - `variation_name` (`string`) - Variation Name | example: `Variation name`
  - `variation_images` (`array of object`) - List Item Variations
    - **Array item properties** (3):
      - `item_id` (`number`) - Item ID | example: `1`
      - `store_id` (`string`) - Store ID | example: `1`
      - `images` (`array of object`) - List Images

### Schema: `saveProductListing`

- **Type**: `object`
- **Required fields**: `item_group_id`, `mp_group_id`, `item_group_name`, `channel_category_id`, `store_id`, `channel_id`, `attributes`, `package_weight`, `variations`, `group_variations`, `selected_variations`, `images`
- **Properties** (20):
  - `item_group_id` (`number`) - Item Group ID | example: `14`
  - `mp_group_id` (`number`) - Marketplace Group ID. To create first time, set value as 0. | example: `4`
  - `item_group_name` (`string`) - Item Group Name (Can not be null/empty string) | example: `Sepatu Kulit Pria Lokal Merk KEREN`
  - `description` (`string`) - Item Description | example: `<p>Model simple dan elegan trend terbaru</p>/n<p>Kualitas bagus harga terjangkau`
  - `channel_category_id` (`number`) - Channel Category ID | example: `2463`
  - `store_id` (`string`) - Store ID | example: `38735`
  - `channel_id` (`number`) - Channel ID | example: `2`
  - `brand_id` (`number`) - Brand ID
  - `package_content` (`string`) - Package Content
  - `package_weight` (`number`) - Package Weight | example: `1000`
  - `package_height` (`number`) - Package Height
  - `package_width` (`number`) - Package Width
  - `package_length` (`number`) - Package Length
  - `brand_name` (`string`) - Brand Name
  - `images` (`array of object`) - List Item Images
    - **Array item properties** (7):
      - `group_image_id` (`number`) - Image ID | example: `66`
      - `url` (`string`) - Image URL | example: `https://jubelio.blob.core.windows.net/images/aggesujkt4uo34nu07a7vg/rug-16502476`
      - `thumbnail` (`string`) - Image Thumbnail | example: `https://jubelio.blob.core.windows.net/images/aggesujkt4uo34nu07a7vg/rug-16502476`
      - `file_name` (`string`) - Image Name | example: `sepatu_kulit.jpg`
      - `sequence_number` (`number`) - Image Sequence Number | example: `0`
      - `channel_info` (`string`) - Channel Info
      - `uid` (`string`) - Image Unique ID | example: `rug-1589963285145-0`
  - `attributes` (`array of object`) - Product Attributes
  - `variations` (`array of object`) - List Item Variations
    - **Array item properties** (14):
      - `status` (`string`)
      - `barcode` (`string`) - Barcode (can be empty string)
      - `item_id` (`number`) - Item ID | example: `14`
      - `buy_price` (`number`) - Buy Price | example: `90000`
      - `channel_id` (`number`) - Channel ID
      - `store_id` (`string`) - Store ID
      - `sell_here` (`boolean`) - Sell here | example: `True`
      - `channel_url` (`string`) - Channel URL
      - `channel_item_id` (`number`) - Channel Item ID
      - `channel_group_id` (`string`) - Channel Group ID
      - `sell_price` (`number`) - Sell Price | example: `150000`
      - `item_code` (`string`) - Item Code | example: `SEP-KUL-PRI-LOK-MER-KER--39-`
      - `variation_name` (`string`) - Variation Name | example: `39-40`
      - `variation_values` (`array of object`) - Item Variations
  - `variation_images` (`array of object`) - List Item Variations
    - **Array item properties** (3):
      - `item_id` (`string`) - Item ID | example: `14`
      - `store_id` (`string`) - Store ID | example: `38735`
      - `images` (`array of object`) - List Item Variations
  - `selected_variations` (`array of string`)
  - `group_variations` (`array of object`)
    - **Array item properties** (2):
      - `label` (`string`) - Variation Label | example: `Ukuran`
      - `values` (`string`) - Variation Values | example: `39-40`

### Schema: `saveProductListingResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - Status | example: `ok`
  - `mp_group_id` (`number`) - Marketplace Group ID. | example: `1245`
  - `store_id` (`string`) - Store ID | example: `38735`

### Schema: `uploadProductListing`

- **Type**: `object`
- **Required fields**: `group_id`, `channel_id`, `store_id`
- **Properties** (3):
  - `group_id` (`number`) - Item Group ID | example: `10`
  - `channel_id` (`number`) - Channel ID | example: `2`
  - `store_id` (`string`) - Store ID | example: `20`

### Schema: `getStoreCategoriesResponse`

- **Type**: `array`
- **Item properties** (2):
  - `category_id` (`string`) - Category Id (UUID) | example: `ed8e8964-d3ab-4101-834b-426b85b241b0`
  - `category_name` (`string`) - Category Name | example: `Bottem/Men`

### Schema: `getAttributeValuesResponse`

- **Type**: `array`
- **Item properties** (4):
  - `attribute_id` (`number`) - Attribute Id | example: `2637`
  - `last_modified` (`string`) - Last modified | example: `2020-10-20T17:00:00.000Z`
  - `value_id` (`number`) - Value Id | example: `34233`
  - `value_name` (`string`) - Value Name | example: `1 Month`

### Schema: `getCategoryAttributesResponse`

- **Type**: `array`
- **Item properties** (2):
  - `attribute_id` (`number`) - Attribute Id | example: `1`
  - `attribute_name` (`string`) - Attribute Name | example: `Periode Garansi`

### Schema: `getCategoryVariantsResponse`

- **Type**: `array`
- **Item properties** (2):
  - `variant_name` (`string`) - Ukuran | example: `4`
  - `variant_values` (`array of object`) - Variant Values

### Schema: `getCategoryMappingResponse`

- **Type**: `array`
- **Item properties** (2):
  - `channel_id` (`number`) - Channel ID | example: `1707`
  - `channel_category_id` (`string`) - Channel Category ID | example: `14730`

### Schema: `getChannelCategoriesResponse`

- **Type**: `array`
- **Item properties** (8):
  - `channel_id` (`number`) - Channel ID | example: `2`
  - `category_id` (`number`) - Category ID | example: `10100387`
  - `category_name` (`string`) - Category Name | example: `Audio`
  - `url` (`string`) - URL
  - `parent_id` (`number`) - Parent ID | example: `0`
  - `variants` (`array of object`)
  - `category_name_alt` (`string`) - Category Name | example: `Audio`
  - `has_children` (`boolean`) - Has Children | example: `True`

### Schema: `getCategoriesResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (4):
      - `category_id` (`number`) - Category ID | example: `1`
      - `category_name` (`string`) - Category Name | example: `Komputer`
      - `parent_id` (`number`) - Category Parent ID | example: `0`
      - `has_children` (`boolean`) - Whether Category has Childern | example: `True`

### Schema: `getCategoryResponse`

- **Type**: `array`
- **Item properties** (5):
  - `category_id` (`number`) - Category ID | example: `1`
  - `category_name` (`string`) - Category Name | example: `Komputer`
  - `parent_id` (`number`) - Category Parent ID | example: `0`
  - `last_modified` (`string`) - Last Modified | example: `2022-09-14T06:57:51.521Z`
  - `has_children` (`boolean`) - Has Children | example: `True`

### Schema: `postInventoryCatalogSetMasterRequest`

- **Type**: `object`
- **Required fields**: `ids`
- **Properties** (1):
  - `ids` (`array of number`)

### Schema: `postInventoryCatalogSetMasterResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) | example: `ok`

### Schema: `postInventoryItemsPutawayRequest`

- **Type**: `object`
- **Required fields**: `putaway_detail_id`, `putaway_id`, `item_id`, `qty_in_base`, `location_id`, `bin_id`
- **Properties** (9):
  - `putaway_detail_id` (`string`) - Putaway Detail ID. To create new, fill the value with 0 | example: `0`
  - `putaway_id` (`string`) - Putaway ID | example: `129`
  - `item_id` (`string`) - Item ID | example: `66251`
  - `qty_in_base` (`number`) - Item Quantity Updates | example: `10`
  - `location_id` (`string`) | example: `1`
  - `bin_id` (`string`) - Bin ID to place the items | example: `126`
  - `batch_no` (`string`) - Batch Number. Fill only if the products have batch no. | example: `AB-DSFHDJS`
  - `serial_no` (`string`) - Serial Number. Fill only if the products have Serial Number.
  - `expired_date` (`string`) | example: `2022-03-10T00:00:00.000Z`

### Schema: `postInventoryItemsPutawayResponse`

- **Type**: `object`
- **Properties** (1):
  - `putaway_detail_id` (`string`) - Putaway Detail ID | example: `3710`

### Schema: `getInventoryItemsReceivedFinishPutawayRequest`

- **Type**: `object`
- **Required fields**: `data`
- **Properties** (1):
  - `data` (`array of object`) - List of putaway ID that has already finished putaway
    - **Array item properties** (1):
      - `ids` (`number`) - putaway_id | example: `172`

### Schema: `getInventoryItemsReceivedFinishPutawayResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `success`

### Schema: `getInventoryItemsToStockResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List items that stock needs to adjust
    - **Array item properties** (18):
      - `item_id` (`number`) - Item ID | example: `58605`
      - `item_group_id` (`number`) - Item Group Id | example: `9093`
      - `item_code` (`string`) - Item Code | example: `SSJDS-6001`
      - `item_name` (`string`) - Item Name | example: `Aqua 1,5 L`
      - `buy_price` (`string`) - Item Buy Price | example: `750`
      - `is_consignment` (`boolean`) - If the product is consignment product | example: `False`
      - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
      - `brand_name` (`string`) - Brand Name
      - `item_full_name` (`string`) - Item Full Name | example: `Celana Panjang Leging Anak Bayi Newborn (0-12 Bulan) Legging Bayi Polos Kaki Tut`
      - `buy_unit` (`string`) - Unit Name | example: `Buah`
      - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
      - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`
      - `use_serial_number` (`boolean`) - If the product has serial number | example: `False`
      - `use_batch_number` (`boolean`) - If the product has batch number | example: `False`
      - `coalesce` (`number`) | example: `833333`
      - `average_cost` (`number`) | example: `833333`
      - `end_qty` (`number`) - latest stock quantity | example: `100`
      - `available_qty` (`number`) | example: `100`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getInventoryItemsToSalesReturnResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Sales Return Items
    - **Array item properties** (21):
      - `item_group_id` (`number`) - Item Group ID | example: `5`
      - `weight_in_gram` (`number`) - Weight of Items | example: `1500`
      - `item_id` (`number`) - Item ID | example: `5`
      - `item_code` (`string`) - Item Code | example: `1203578196`
      - `item_name` (`number`) - Item Name | example: `Tas selempang Biru Dongker`
      - `sell_price` (`number`) - Sell Price | example: `30000`
      - `promotion_price` (`number`) - Promotion Price | example: `10000`
      - `start_date` (`string`) - Start Date
      - `end_date` (`string`) - End Date
      - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
      - `sell_tax_id` (`number`) - Sell Tax ID | example: `1`
      - `sell_unit` (`string`) - Sell Unit Name | example: `Buah`
      - `available_qty` (`number`) - Available Quantity | example: `1000`
      - `qty_in_base` (`string`) - Quantity Item that will be reduced | example: `1`
      - `rate` (`string`) - Rate | example: `10`
      - `tax_name` (`string`) - Tax Name | example: `PPN`
      - `account_code` (`string`) - account code | example: `4-4000`
      - `account_name` (`string`) - Account Name | example: `4-4000 - Penjualan`
      - `uom_id` (`number`) - Uom ID | example: `-1`
      - `item_full_name` (`string`) - Item Full Name | example: `Tas Keren - Tas Selempang Biru Dongker`
      - `average_cost` (`string`) | example: `400000`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getInventoryItemsbyTransferid`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Items based on Transfer No.
    - **Array item properties** (10):
      - `item_transfer_detail_id` (`number`) | example: `4832`
      - `item_id` (`number`) | example: `65476`
      - `item_code` (`string`) | example: `101263074573`
      - `item_name` (`string`) | example: `ABY LEON Sleepsuit Bayi Baby Sleepsuit COTTON JP-GY-052 Jumpsuit Bayi Laki-laki`
      - `available_qty` (`number`) | example: `1`
      - `item_full_name` (`string`) | example: `101263074573 - BABY LEON Sleepsuit Bayi Baby Sleepsuit COTTON JP-GY-052 Jumspuit`
      - `uom_id` (`number`) | example: `-1`
      - `buy_unit` (`string`) | example: `Buah`
      - `item_group_id` (`number`) | example: `9851`
      - `thumbnail` (`string`) | example: `/images/no-image-icon2.png`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getBundlesResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (8):
      - `item_group_id` (`number`) - Item Group ID | example: `1931`
      - `item_name` (`string`) - Item Name | example: `Gelas Chopper dan Olive Oil Filippo`
      - `last_modified` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
      - `item_category_id` (`number`) - Item Category ID | example: `690`
      - `variants` (`array of object`) - List Item Variants
      - `online_status` (`array of object`) - List Channel where Item Exists
      - `thumbnail` (`string`) - Item Thumbnail | example: `https://jubelio.blob.core.windows.net/images/sng8ijwwqasgxnomjslrjw/4469a64e-862`
      - `variations` (`string`) - Variation
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getProductsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (8):
      - `item_group_id` (`number`) - Item Group ID | example: `1931`
      - `item_name` (`string`) - Item Name | example: `Aegis Hospitality Brankas Digital Kecil Aegis Safe Deposit Box Hotel A2143 - Hit`
      - `last_modified` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
      - `variations` (`array of object`) - List Item Variations
      - `item_category_id` (`number`) - Item Category ID | example: `690`
      - `variants` (`array of object`) - List Item Variants
      - `online_status` (`array of object`) - List Channel where Item Exists
      - `thumbnail` (`string`) - Item Thumbnail | example: `https://jubelio.blob.core.windows.net/images/sng8ijwwqasgxnomjslrjw/4469a64e-862`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveProductBundleRequest`

- **Type**: `object`
- **Required fields**: `item_group_id`, `item_group_name`, `uom_id`, `description`, `sell_this`, `sell_tax_id`, `buy_tax_id`, `sales_acct_id`, `cogs_acct_id`, `invt_acct_id`, `buy_this`, `stock_this`, `sell_unit`, `buy_unit`, `is_active`, `item_category_id`, `package_weight`, `channels`, `variations`, `sell_price`, `brand_id`, `brand_name`, `use_single_image_set`, `use_serial_number`, `product_skus`, `is_bundle`, `bundles`
- **Properties** (37):
  - `item_group_id` (`number`) - Item Group ID <br>
To create new prouct => "item_group_id": 0 <br>
To edit prouct => "item_group_id": {item_group_id}
 | example: `0`
  - `item_group_name` (`string`) - Item Group Name (Unique)
 | example: `10.4 10W40`
  - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
  - `description` (`string`) - Item Description | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `sell_this` (`boolean`) - Whether Item can be sell | example: `True`
  - `buy_this` (`boolean`) - Whether Item can be bought | example: `True`
  - `stock_this` (`boolean`) - Whether Item can be stock | example: `True`
  - `buy_price` (`number`) - Buy Price | example: `0`
  - `sell_price` (`number`) - Item Sell Price | example: `3600000`
  - `sell_tax_id` (`number`) - Sell Tax ID Default (PPN = -1, No PPN = 1) | example: `-1`
  - `buy_tax_id` (`number`) - Buy Tax ID Default (PPN = -1, No PPN = 1) | example: `-1`
  - `sales_acct_id` (`number`) - Sales Account ID (default = 28) | example: `28`
  - `cogs_acct_id` (`number`) - Cost of Goods Sold (COGS) Account Account ID (default = 30) | example: `30`
  - `purch_acct_id` (`number`) - Purchase Account ID (default = NULL)
  - `invt_acct_id` (`number`) - Inventory Account ID (default = 4) | example: `4`
  - `sell_unit` (`string`) - Sell Unit | example: `Buah`
  - `rop` (`number`) - Re-Order Point. Stock limit that is used to decide when we need to adjust/update the stock. | example: `20`
  - `item_category_id` (`number`) - Item Category ID | example: `454`
  - `store_priority_qty_treshold` (`number`) - Store Priority Treshold | example: `2`
  - `channels` (`array of object`) - Sales Channels, could be Marketplace/other channels.
    - **Array item properties** (3):
      - `store_id` (`string`) - Store ID | example: `359`
      - `channel_name` (`number`) - Channel Name | example: `Elevenia`
      - `store_name` (`string`) - Store Name | example: `truzteeshop`
  - `use_serial_number` (`boolean`) - Whether the item use serial number | example: `False`
  - `use_single_image_set` (`boolean`) | example: `False`
  - `brand_id` (`string`) - Brand ID
  - `dropship_this` (`boolean`) - Whether Item can be drop ship | example: `False`
  - `is_active` (`boolean`) - Whether Item is active | example: `True`
  - `package_content` (`string`) - Package Content | example: `Plastik and How to Use`
  - `package_weight` (`number`) - Package Weight | example: `1000`
  - `package_height` (`number`) - Package Height | example: `29`
  - `package_width` (`number`) - Package Width | example: `49`
  - `package_length` (`number`) - Package Length | example: `39`
  - `variations` (`array of object`) - List Item Variations, fill only if your products have variations.
    - **Array item properties** (2):
      - `label` (`string`) - Variation Label | example: `Warna`
      - `values` (`array of string`) - List Variation Values
  - `brand_name` (`string`) - Another Brand Name | example: `Adidas`
  - `product_skus` (`array of object`) - List Item SKUs
    - **Array item properties** (7):
      - `item_id` (`number`) - Item ID | example: `0`
      - `item_code` (`string`) - Item Code (Unique)
 | example: `RIC-COO-MIY-RCM-PIN`
      - `variation_values` (`array of object`) - Item Variations
      - `sell_price` (`number`) - Item Sell Price Variant | example: `240000`
      - `prices` (`array of object`) - List Price on Channels
      - `images` (`array of object`) - List Item Variations
      - `is_bundle` (`boolean`) - Whether product is a bundle item | example: `True`
  - `bom_id` (`number`) - for Bundles (optional) | example: `0`
  - `bundles` (`array of object`) - List Item SKUs (optional)
    - **Array item properties** (5):
      - `bom_comp_id` (`number`) - Bom Comp ID, set as 0 when first create product bundle | example: `0`
      - `item_id` (`number`) - Item ID | example: `1`
      - `qty` (`number`) - Quantity | example: `5`
      - `uom_id` (`number`) - Unit of Measure ID | example: `5`
      - `unit` (`string`) - Unit | example: `Buah`
  - `unlimited_stock_store_ids` (`number`) - The unlimited stock for selected store ids. <br>
Can be filled with "empty array" or "null".

  - `buy_unit` (`string`) - Buy Unit | example: `Buah`

### Schema: `saveProductBundleResponse`

- **Type**: `object`
- **Properties** (4):
  - `status` (`string`) - Status | example: `OK`
  - `id` (`string`) - ID | example: `12`
  - `bom_id` (`string`) - Bom ID | example: `1`
  - `bom_comp_ids` (`array of integer`)

### Schema: `getProductResponse`

- **Type**: `object`
- **Properties** (54):
  - `item_group_id` (`number`) - Item Group ID | example: `2`
  - `item_group_name` (`string`) - Item Group Name | example: `10.4 10W40`
  - `description` (`string`) - Item Description | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `notes` (`string`) - Item Description | example: `semi-synthetic lubricant for 4-stroke motorcycles that ensures`
  - `sell_tax_id` (`number`) - Sell Tax ID | example: `-1`
  - `buy_tax_id` (`number`) - Buy Tax ID | example: `-1`
  - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
  - `cogs_acct_id` (`number`) - Cost of Goods Sold (COGS) Account Account ID | example: `30`
  - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
  - `sell_this` (`boolean`) - Whether Item can be sell | example: `True`
  - `buy_this` (`boolean`) - Whether Item can be bought | example: `True`
  - `stock_this` (`boolean`) - Whether Item can be stock | example: `True`
  - `dropship_this` (`boolean`) - Whether Item can be drop ship | example: `False`
  - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
  - `sell_unit` (`string`) - Sell Unit | example: `Botol`
  - `buy_unit` (`string`) - Buy Unit | example: `Botol`
  - `is_active` (`boolean`) - Whether Item is active | example: `True`
  - `purch_acct_id` (`number`) - Purchase Account ID | example: `-1`
  - `status` (`number`) - Status | example: `null`
  - `item_category_id` (`number`) - Item Category ID | example: `454`
  - `package_content` (`string`) - Package Content | example: `Plastik and How to Use`
  - `package_weight` (`string`) - Package Weight | example: `1000`
  - `package_height` (`string`) - Package Height | example: `29`
  - `package_width` (`string`) - Package Width | example: `49`
  - `package_length` (`string`) - Package Length | example: `39.5`
  - `variations` (`array of object`) - List Item Variations
    - **Array item properties** (2):
      - `label` (`string`) - Variation Label | example: `color_family`
      - `values` (`array of string`) - List Variation Values
  - `sell_price` (`number`) - Item Sell Price | example: `3600000`
  - `buy_price` (`string`) - Item Buy Price | example: `1500000`
  - `last_modified` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
  - `brand_id` (`number`) - Brand ID | example: `11087`
  - `rop` (`number`) - Return of Purchase | example: `10`
  - `is_favourite` (`boolean`) - Whether Item a favourite | example: `False`
  - `use_single_image_set` (`boolean`) - Whether Item use Single Image Set | example: `False`
  - `use_serial_number` (`boolean`) - Whether Item use Serial Number | example: `True`
  - `brand_name` (`string`) - Another Brand Name | example: `Mikoooo`
  - `sell_tax_name` (`string`) - Sell Tax Name | example: `No Tax`
  - `buy_tax_name` (`string`) - Buy Tax Name | example: `No Tax`
  - `sales_acct_name` (`string`) - Sales Account Name | example: `4-4000 - Penjualan`
  - `invt_acct_name` (`string`) - Inventory Account Name | example: `1-1200 - Persediaan Barang`
  - `cogs_acct_name` (`string`) - Cost of Goods Sold (COGS) Account Name | example: `5-5000 - Harga Pokok Penjualan (COGS)`
  - `purch_acct_name` (`string`) - Purchase Account Name | example: `5-5000 - Harga Pokok Penjualan (COGS)`
  - `uom_name` (`string`) - Unit of Measure Name | example: `Buah`
  - `product_skus` (`array of object`) - List Item SKUs
    - **Array item properties** (10):
      - `item_id` (`number`) - Item ID | example: `2270`
      - `item_code` (`string`) - Item Code | example: `RIC-COO-MIY-RCM-PIN`
      - `sell_price` (`number`) - Item Sell Price Variant | example: `240000`
      - `end_qty` (`number`) - Total quantity on-hand (Current item quantity) | example: `10`
      - `average_cost` (`number`) - Average Cost | example: `240000`
      - `amount` (`number`) - Amount is a sell price multiplied with the total quantity on-hand (end_qty) | example: `240000`
      - `barcode` (`string`) - Barcode
      - `variation_values` (`array of object`) - Item Variations
      - `prices` (`array of object`) - List Price on Channels
      - `images` (`array of object`) - List Item Variations
  - `channels` (`array of object`) - List Channels
    - **Array item properties** (11):
      - `channel_id` (`number`) - Channel ID | example: `4`
      - `channel_name` (`string`) - Channel Name | example: `Lazada`
      - `store_name` (`string`) - Store Name | example: `Dreamcatcher`
      - `store_id` (`string`) - Store ID | example: `125`
      - `extra_info` (`object`) - Extra Info [Different for Every Channels]
      - `channel_full_name` (`string`) - Channel Full Name | example: `Lazada - Dreamcatcher`
      - `attributes` (`array of object`) - Channel Attributes [Different for Every Channels]
      - `channel_url` (`string`) - Channel URL | example: `https://lazada.co.id`
      - `channel_category_id` (`string`) - Channel Category ID | example: `14638`
      - `sell_here` (`boolean`) - Whether Item will be sell in this channel | example: `True`
      - `channel_item_id` (`string`) - Channel Item ID | example: `1241241`
  - `min` (`number`) - Minimal Item Purchase | example: `1`
  - `max` (`number`) - Maximal Item Purchase | example: `10`
  - `selected_brand_name` (`string`) - Selected Brand Name | example: `Miyako`
  - `bom_id` (`number`) - .
  - `store_priority_qty_treshold` (`number`) - Store priority Quantity
  - `created_date` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
  - `lead_time` (`string`) - Lead time
  - `is_po` (`boolean`) - Is ProOrder
  - `use_batch_number` (`boolean`) - .
  - `bundles` (`array of object`) - List Channels
    - **Array item properties** (8):
      - `bom_comp_id` (`number`) - . | example: `1`
      - `item_code` (`string`) - Item Code | example: `RIC-COO-MIY-RCM-PIN`
      - `item_id` (`number`) - Item ID | example: `1`
      - `item_name` (`string`) - Item name | example: `Barang 1`
      - `qty` (`number`) - Quantity | example: `5`
      - `thumbnail` (`string`) - Thumbail URL | example: `http://f.shopee.co.id/file/fde755988e7d8931bea57bdb3c8a64e6`
      - `unit` (`string`) - Unit
      - `uom_id` (`number`) - Unit of Measure ID | example: `-1`

### Schema: `statusOK`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) | example: `ok`

### Schema: `getInventoryItemsArchivedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (9):
      - `item_group_id` (`string`) - Item Group ID | example: `1931`
      - `item_name` (`string`) - Item Name | example: `Dompet Jube`
      - `last_modified` (`string`) | example: `2019-01-07T07:53:35.100Z`
      - `variations` (`array of object`)
      - `item_category_id` (`string`) - Item Category ID | example: `690`
      - `total_composition` (`number`) - Total BOM composition | example: `2`
      - `variants` (`array of object`)
      - `online_status` (`array of object`)
      - `thumbnail` (`string`) | example: `https://jubelio.blob.core.windows.net/images/sng8ijwwqasgxnomjslrjw/4469a64e-862`
  - `totalCount` (`number`) - total count of all data | example: `8200`

### Schema: `getInventoryItemsReceivedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Items Have Been Received
    - **Array item properties** (19):
      - `trx_id` (`string`) - Transaction ID from Bills, Return, or Transfer | example: `5395`
      - `trx_no` (`string`) - Transaction Number | example: `TRFI-000005395`
      - `transaction date` (`string`) | example: `2022-02-15T11:05:44.970Z`
      - `location_id` (`number`) - Location ID | example: `1`
      - `location_name` (`string`) - Location Name | example: `Gudang BESAR`
      - `note` (`string`)
      - `source_id` (`number`) | example: `1`
      - `source_no` (`string`) | example: `TRF-000005291`
      - `created_by` (`string`) - Email's staff who received the items | example: `juberliaa@jubelio.com`
      - `created_name` (`string`) - Staff who received the items | example: `sofyan`
      - `doing_by` (`string`) - Email's staff who put away the items | example: `dudung@yopmail.com`
      - `doing_name` (`string`) - Staff name who put away the items | example: `Ririn`
      - `putaway_id` (`number`) - Putaway ID
      - `putaway_no` (`string`) - Putaway No.
      - `from_no` (`number`) - Qty that have been received | example: `0`
      - `to_no` (`number`) - total qty that should be received | example: `5`
      - `wms_migration_date` (`string`) | example: `2021-09-28T06:49:05.851Z`
      - `msg_serial` (`string`)
      - `lock_data` (`boolean`) | example: `False`
  - `totalCount` (`number`) - total count of all items | example: `110`

### Schema: `getItemBatchNumberResponse`

- **Type**: `object`
- **Properties** (3):
  - `location_id` (`number`) - Adjustment Location | example: `-1`
  - `location_name` (`string`) - Adjustment Location Name | example: `Pusat`
  - `item_location` (`array of object`) - List Item Location
    - **Array item properties** (4):
      - `location_id` (`number`) - Adjustment Location | example: `-1`
      - `item_id` (`number`) - Item ID | example: `1`
      - `qty` (`string`) - Total Item Quantity | example: `-65`
      - `batchs` (`array of object`) - List Item Location

### Schema: `SplitItemRequest`

- **Type**: `object`
- **Properties** (3):
  - `item_group_id` (`string`) - Item Group ID | example: `5876`
  - `new_item_group_name` (`string`) - The new item group name for the item that has been split | example: `3second Kaos M All Colours`
  - `items` (`array of object`)
    - **Array item properties** (2):
      - `item_id` (`string`) - Item ID | example: `11176`
      - `status` (`boolean`) - Set true for items that are going to be split. | example: `True`

### Schema: `SplitItemPostResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - Status | example: `ok`

### Schema: `getInventoryItemsbyInvoiceResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List of Items by Invoice No.
    - **Array item properties** (21):
      - `item_id` (`number`) - Item ID | example: `5`
      - `item_code` (`string`) - Item Code | example: `1203578196`
      - `item_name` (`number`) - Item Name | example: `Tas selempang Biru Dongker`
      - `invoice_detail_id` (`number`) - Invoice Detail ID | example: `0`
      - `sell_price` (`number`) - Sell Price | example: `30000`
      - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
      - `sell_tax_id` (`number`) - Sell Tax ID | example: `1`
      - `sell_unit` (`string`) - Sell Unit Name | example: `Buah`
      - `available_qty` (`number`) - Available Quantity | example: `1000`
      - `qty_in_base` (`string`) - Quantity Item that will be reduced | example: `1`
      - `disc` (`string`) - Item Discount | example: `0`
      - `disc_amount` (`string`) - Item Total Amount | example: `0`
      - `cogs` (`number`) - Cost of Goods Sold | example: `11666.666667`
      - `rate` (`string`) - Rate | example: `10`
      - `tax_name` (`string`) - Tax Name | example: `PPN`
      - `account_code` (`string`) - account code | example: `4-4000`
      - `account_name` (`string`) - Account Name | example: `4-4000 - Penjualan`
      - `uom_id` (`number`) - Uom ID | example: `-1`
      - `use_batch_number` (`boolean`) - Whether the item has a batch number | example: `False`
      - `use_serial_number` (`boolean`) - Whether the item has serial number | example: `True`
      - `item_full_name` (`string`) - Item Full Name | example: `Tas Keren - Tas Selempang Biru Dongker`

### Schema: `getChannelAttributesResponse`

- **Type**: `array`
- **Item properties** (9):
  - `channel_id` (`number`) - Channel ID | example: `4`
  - `attribute_name` (`string`) - Attribute Name | example: `color_family`
  - `attribute_type` (`string`) - Attribute Type | example: `normal`
  - `category_id` (`string`) - Channel Category ID | example: `14730`
  - `default_value` (`string`) - Default Value
  - `display_name` (`string`) - Display Name on Web | example: `Warranty Period`
  - `input_type` (`string`) - Input Type Attribute | example: `singleSelect`
  - `is_required` (`boolean`) - Is Attribute Required | example: `True`
  - `attribute_values` (`array of object`) - Attribute Values

### Schema: `getChannelCategoryResponse`

- **Type**: `array`
- **Item properties** (3):
  - `category_id` (`string`) - Channel Category ID | example: `12652`
  - `category_name` (`string`) - Category Name | example: `Spare Parts`
  - `parent_id` (`string`) - Channel Parent Category ID | example: `40`

### Schema: `getUploadProductErrorsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (9):
      - `action` (`string`) - Action Name | example: `create`
      - `channel_id` (`number`) - Channel ID | example: `1`
      - `error_date` (`string`) - Error date | example: `2020-05-14T18:01:42.539Z`
      - `error_text` (`string`) - Reason error | example: `No refresh token defined`
      - `item_group_id` (`number`) - Item Group ID | example: `50`
      - `item_group_name` (`string`) - Item Group Name | example: `3Second Men Denim Pants 080319`
      - `store_id` (`string`) - Store ID | example: `1`
      - `store_name` (`string`) - Store Name | example: `BUKALAPAK - Toko`
      - `success` (`boolean`) - Status | example: `False`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getPriceListResponse`

- **Type**: `object`
- **Properties** (5):
  - `channels` (`array of object`) - List Channels
    - **Array item properties** (3):
      - `store_id` (`string`) - Store ID | example: `359`
      - `channel_name` (`number`) - Channel Name | example: `Elevenia`
      - `store_name` (`string`) - Store Name | example: `truzteeshop`
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (7):
      - `item_group_id` (`number`) - Item Group ID | example: `1`
      - `item_id` (`number`) - Item ID | example: `2273`
      - `item_name` (`string`) - Item Name | example: `Baju Corak Carik Warna Warni`
      - `item_code` (`string`) - Item Code | example: `BLACK`
      - `brand_name` (`string`) - Brand Name
      - `prices` (`array of object`) - List Item Prices
      - `last_modified` (`string`) - Last Modified
  - `totalCount` (`number`) - Total Count of All Items | example: `1`
  - `modified_by` (`array of string`)
  - `channel_status` (`array of string`)

### Schema: `getProductsReviewResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (8):
      - `item_group_id` (`number`) - Item Group ID | example: `1931`
      - `item_name` (`string`) - Item Name | example: `Aegis Hospitality Brankas Digital Kecil Aegis Safe Deposit Box Hotel A2143 - Hit`
      - `last_modified` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
      - `variations` (`array of object`) - List Item Variations
      - `item_category_id` (`number`) - Item Category ID | example: `690`
      - `variants` (`array of object`) - List Item Variants
      - `online_status` (`array of object`) - List Channel where Item Exists
      - `thumbnail` (`string`) - Item Thumbnail | example: `https://jubelio.blob.core.windows.net/images/sng8ijwwqasgxnomjslrjw/4469a64e-862`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getProductsMasterResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (8):
      - `item_group_id` (`number`) - Item Group ID | example: `1931`
      - `item_name` (`string`) - Item Name | example: `Aegis Hospitality Brankas Digital Kecil Aegis Safe Deposit Box Hotel A2143 - Hit`
      - `last_modified` (`string`) - Last Modified Time | example: `2019-01-07T07:53:35.100Z`
      - `variations` (`array of object`) - List Item Variations
      - `item_category_id` (`number`) - Item Category ID | example: `690`
      - `variants` (`array of object`) - List Item Variants
      - `online_status` (`array of object`) - List Channel where Item Exists
      - `thumbnail` (`string`) - Item Thumbnail | example: `https://jubelio.blob.core.windows.net/images/sng8ijwwqasgxnomjslrjw/4469a64e-862`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `setItemToAdjustResponse`

- **Type**: `array`
- **Item properties** (10):
  - `item_id` (`number`) - Item ID | example: `1`
  - `item_name` (`string`) - Item Name | example: `Addison Jacket`
  - `item_full_name` (`string`) - Item Full Name | example: `DYSW351-Addison Jacket`
  - `unit` (`string`) - Unit | example: `Pcs`
  - `account_id` (`number`) - Account ID | example: `1`
  - `account_code` (`string`) - Account Code | example: `1-1200`
  - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`
  - `cost` (`number`) - Cost | example: `371777.7777833333`
  - `end_qty` (`number`) - End QTY | example: `0`
  - `resulting_qty` (`number`) - Resulting QTY | example: `0`

### Schema: `getItemsToSellResponse`

- **Type**: `array`
- **Item properties** (21):
  - `item_group_id` (`number`) - Item Group Id | example: `2642`
  - `item_id` (`number`) - Item ID | example: `1`
  - `item_name` (`string`) - Item Name | example: `Addison Jacket`
  - `item_code` (`string`) - Item Code/SKU | example: `chopper dan olive oil`
  - `sell_price` (`number`) - Sell Price | example: `25000`
  - `promotion_price` (`number`) - Promotion Price
  - `start_date` (`string`)
  - `end_date` (`string`)
  - `sell_unit` (`string`) - Unit | example: `Buah`
  - `account_code` (`string`) - Account Code | example: `4-4000`
  - `account_name` (`string`) - Account Name | example: `4-4000 - Penjualan`
  - `sell_tax_id` (`number`) - Sell tax id | example: `1`
  - `rate` (`number`) | example: `11`
  - `tax_name` (`string`) - Tax Name | example: `PPN 11%`
  - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
  - `sales_acct_id` (`string`) - Sales Account ID | example: `28`
  - `item_full_name` (`string`) - Item Full Name | example: `EYE-KOS-NAR-WAN-MER - Eyeshadow Kosmetik NARS Wanita - Merah`
  - `item_short_name` (`string`) - Item Short Name | example: `Eyeshadow Kosmetik NARS Wanita - Merah`
  - `thumbnail` (`string`)
  - `is_bundle` (`boolean`) - Whether product is a bundle item | example: `False`
  - `average_cost` (`number`) - average_cost

### Schema: `getInventoryStockOpnameFloorsResponse`

- **Type**: `array`
- **Item properties** (2):
  - `floor_id` (`number`) - Floor ID | example: `1`
  - `floor_code` (`string`) - Floor Code | example: `LX`

### Schema: `getInventoryStockOpnameRowsResponse`

- **Type**: `array`
- **Item properties** (2):
  - `row_id` (`number`) - Row ID | example: `1`
  - `row_code` (`string`) - Row Code | example: `BX`

### Schema: `getInventoryStockOpnameColumnsResponse`

- **Type**: `array`
- **Item properties** (2):
  - `column_id` (`number`) - Column ID | example: `1`
  - `column_code` (`string`) - Column Code | example: `BX-KX`

### Schema: `getInventoryStockOpnameResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`)
    - **Array item properties** (17):
      - `opname_header_id` (`number`) - Opname Header ID | example: `5`
      - `opname_no` (`string`) - Opname No. | example: `OP-000000005`
      - `location_id` (`number`) - Location ID | example: `1`
      - `created_date` (`string`) | example: `2022-02-17T07:35:36.214Z`
      - `created_by` (`string`) | example: `ririn@staffgudang.com`
      - `process_by` (`string`) | example: `ririn@staffgudang.com`
      - `note` (`string`)
      - `finalized_date` (`string`)
      - `finalized_by` (`string`)
      - `item_adj_id` (`number`)
      - `status` (`number`) | example: `0`
      - `filter_floor_id` (`number`) | example: `1`
      - `filter_row_ids` (`array of number`)
      - `filter_column_ids` (`array of number`)
      - `printed_by` (`string`)
      - `printed_date` (`string`)
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`

### Schema: `postInventoryStockOpnameRequest`

- **Type**: `object`
- **Required fields**: `opname_header_id`, `opname_no`, `process_by`, `location_id`, `filter_floor_id`, `filter_row_ids`, `filter_column_ids`, `items`
- **Properties** (9):
  - `opname_header_id` (`number`) - Fill in the value as 0 to first create the item list. | example: `0`
  - `opname_no` (`number`) - Opname Number. Automatically set by the system. | example: `[auto]`
  - `process_by` (`string`) - Staff who's doing the opname | example: `ririn@staffgudang.com`
  - `location_id` (`number`) - Location ID | example: `1`
  - `filter_floor_id` (`number`) - Floor ID where items are placed | example: `1`
  - `filter_row_ids` (`array of number`)
  - `filter_column_ids` (`array of number`)
  - `note` (`string`) - Note
  - `items` (`array of object`)
    - **Array item properties** (8):
      - `item_id` (`number`) - Item ID | example: `1`
      - `bin_id` (`number`) - Bin ID | example: `1`
      - `serial_no` (`string`) - Serial No.
      - `batch_no` (`string`) - Batch No.
      - `qty_system` (`number`) - Current quantity for the items in the system | example: `900`
      - `qty` (`number`) - Quantity to adjust. Use - to reduce stock, for example -10 | example: `0`
      - `expired_date` (`string`)
      - `opname_detail_id` (`number`) - Opname Detail ID | example: `0`

### Schema: `postInventoryStockOpnameResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `ok`

### Schema: `getInventoryStockOpnameOpnameHeaderIdResponse`

- **Type**: `object`
- **Properties** (21):
  - `items` (`array of object`)
    - **Array item properties** (15):
      - `opname_detail_id` (`number`) - Opname Detail ID | example: `13`
      - `item_id` (`number`) - Item ID | example: `1`
      - `serial_no` (`string`) - Serial Number
      - `batch_no` (`string`) - Batch Number
      - `bin_id` (`number`) - Bin ID | example: `1`
      - `quantity` (`number`) - Quantity of items to opname | example: `0`
      - `qty_system` (`number`) - Current quantity of items | example: `900`
      - `reason_type` (`string`) - Reason Type
      - `expired_date` (`string`) - Expired Date
      - `has_expired_date` (`boolean`) | example: `False`
      - `bin_final_code` (`string`) - Bin Final Code | example: `LX-BX-KX-RX`
      - `item_full_name` (`string`) - Item Full Name | example: `SAR-TAN-BAG-BAN-HIJ - SARUNG TANGAN BAGUS BANGET - Hijau`
      - `use_serial_number` (`boolean`) | example: `False`
      - `user_batch_number` (`boolean`) | example: `False`
      - `qty_differ` (`number`) | example: `-900`
  - `opname_header_id` (`number`) - Opname Header ID | example: `3`
  - `opname_no` (`string`) - Opname No. | example: `OP-00000003`
  - `location_id` (`number`) - Location ID | example: `1`
  - `created_date` (`string`) - Created Date | example: `2022-02-17T07:20:41.361Z`
  - `created_by` (`string`) - Warehouse Staff | example: `ririn@staffgudang.com`
  - `process_by` (`string`) | example: `ririn@staffgudang.com`
  - `note` (`string`)
  - `finalized_date` (`string`)
  - `finalized_by` (`string`)
  - `item_adj_id` (`number`)
  - `status` (`number`) | example: `1`
  - `filter_floor_id` (`number`) | example: `1`
  - `filter_row_ids` (`array of number`)
  - `filter_column_ids` (`array of number`)
  - `printed_by` (`string`) | example: `ririn@staffgudang.com`
  - `printed_date` (`string`) | example: `2022-02-17T07:20:59.282Z`
  - `location_name` (`string`) - Location Name | example: `Pusat`
  - `selected_filter_floor` (`object`)
    - `id` (`number`) - Floor ID | example: `1`
    - `text` (`string`) | example: `LX`
  - `selected_filter_row` (`object`)
    - `id` (`number`) - Row ID | example: `1`
    - `text` (`string`) | example: `BX`
  - `selected_filter_column` (`object`)
    - `id` (`number`) - Column ID | example: `1`
    - `text` (`string`) | example: `KX`

### Schema: `getInventoryStockOpnameBinsResponse`

- **Type**: `array`
- **Item properties** (2):
  - `bin_id` (`string`) - Bin ID | example: `108`
  - `bin_final_code` (`string`) - Bin Final Code | example: `L1-A1-K1-R1`

### Schema: `getInventoryStockOpnameItemsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`)
    - **Array item properties** (9):
      - `item_id` (`number`) - Item ID | example: `58605`
      - `item_full_name` (`string`) - Item Full Name | example: `Celana Panjang Leging Anak Bayi Newborn (0-12 Bulan) Legging Bayi Polos Kaki Tut`
      - `location_id` (`number`) - Location ID
      - `bin_id` (`number`) - Bin ID
      - `serial_no` (`string`) - Serial No.
      - `batch_no` (`string`) - Batch No.
      - `qty` (`number`) - Quantity | example: `0`
      - `use_serial_number` (`boolean`) | example: `False`
      - `use_batch_number` (`boolean`) | example: `False`
  - `totalCount` (`number`) - total count of all data | example: `8200`

### Schema: `postInventoryStockOpnameFinalizeRequest`

- **Type**: `object`
- **Required fields**: `id`
- **Properties** (1):
  - `id` (`number`) - Opname Header ID | example: `3`

### Schema: `postInventoryStockOpnameFinalizeResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - status | example: `ok`

### Schema: `getNeedRestockProductsResponse`

- **Type**: `array`
- **Item properties** (7):
  - `available_qty` (`number`) - available qty | example: `-1`
  - `end_qty` (`number`) - Total Inventory on Hand | example: `0`
  - `item_code` (`string`) - Item Code/SKU | example: `chopper dan olive oil`
  - `item_id` (`number`) - Item ID | example: `1`
  - `item_name` (`string`) - Item Name | example: `Addison Jacket`
  - `order_qty` (`number`) - Total Inventory on Order | example: `1`
  - `thumbnail` (`string`) - Item Thumbnail | example: `https://jubelio.blob.core.windows.net/images/sng8ijwwqasgxnomjslrjw/4469a64e-862`

### Schema: `getOutOfStockInOrderProductsResponse`

- **Type**: `array`
- **Item properties** (11):
  - `available_qty` (`number`) - available qty | example: `-1`
  - `end_qty` (`number`) - Total Inventory on Hand | example: `0`
  - `item_code` (`string`) - Item Code/SKU | example: `chopper dan olive oil`
  - `item_id` (`number`) - Item ID | example: `1`
  - `item_name` (`string`) - Item Name | example: `Addison Jacket`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `location_name` (`number`) - Location Name | example: `Pusat`
  - `order_qty` (`number`) - Total Inventory on Order | example: `1`
  - `qty_in_base` (`number`) - Quantity that will be add | example: `1`
  - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000006`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-11-19T01:46:21.000Z`

### Schema: `savePriceListRequest`

- **Type**: `array`
- **Item properties** (3):
  - `item_group_id` (`number`) - Item Group ID | example: `984`
  - `item_id` (`number`) - Item ID | example: `2286`
  - `prices` (`array of object`) - List Prices for Every Store

### Schema: `ok`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) - Status | example: `ok`

### Schema: `getPromotionsResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (6):
      - `promotion_name` (`string`) - Promotion Name | example: `BLACK FRIDAY`
      - `promotion_id` (`number`) - Promotion ID | example: `1`
      - `start_date` (`string`) - Start Promotion Date | example: `2018-10-02T04:00:00.000Z`
      - `end_date` (`string`) - End Promotion Date | example: `2018-10-03T05:00:00.000Z`
      - `details` (`array of object`)
      - `channels` (`array of object`) - List Channels where Promotions applied

### Schema: `savePromotionRequest`

- **Type**: `object`
- **Required fields**: `end_date`, `promotion_id`, `promotion_name`, `start_date`, `channels`, `details`
- **Properties** (6):
  - `promotion_id` (`number`) - Promotion ID. To first create, set value as 0. | example: `0`
  - `promotion_name` (`string`) - Promotion Name | example: `BLACK FRIDAY`
  - `start_date` (`string`) - Start Promotion Date | example: `2018-10-02T04:00:00.000Z`
  - `end_date` (`string`) - End Promotion Date | example: `2018-10-03T05:00:00.000Z`
  - `channels` (`array of object`) - List Channels where Promotions applied
    - **Array item properties** (2):
      - `store_id` (`string`) - Store ID | example: `359`
      - `channel_id` (`number`) - Channel ID | example: `64`
  - `details` (`array of object`) - List Promotion Detail
    - **Array item properties** (4):
      - `promotion_detail_id` (`number`) - Promotion Detail ID | example: `0`
      - `item_group_id` (`number`) - Item Group ID | example: `20`
      - `item_id` (`number`) - Item ID | example: `105147`
      - `promotion_price` (`number`) - Promotion Price | example: `250000`

### Schema: `savePromotionResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Status | example: `ok`
  - `id` (`number`) - Promotion Id | example: `22`

### Schema: `getPromotionResponse`

- **Type**: `object`
- **Properties** (8):
  - `promotion_id` (`number`) - Promotion ID | example: `0`
  - `promotion_name` (`string`) - Promotion Name | example: `BLACK FRIDAY`
  - `start_date` (`string`) - Start Promotion Date | example: `2018-10-02T04:00:00.000Z`
  - `end_date` (`string`) - End Promotion Date | example: `2018-10-03T05:00:00.000Z`
  - `is_applied` (`boolean`) - Whether Promotion Applied | example: `False`
  - `channel_info` (`array of object`) - List Channels Info
    - **Array item properties** (3):
      - `store_id` (`string`) - Store ID | example: `359`
      - `channel_id` (`number`) - Channel ID | example: `64`
      - `discount_id` (`number`) - Discount ID | example: `1007180959`
  - `channels` (`array of object`) - List Channels where Promotions applied
    - **Array item properties** (3):
      - `store_id` (`string`) - Store ID | example: `359`
      - `channel_id` (`number`) - Channel ID | example: `64`
      - `channel_full_name` (`number`) - Channel Full Name | example: `Bukalapak`
  - `details` (`array of object`) - List Promotion Detail
    - **Array item properties** (8):
      - `promotion_detail_id` (`number`) - Promotion Detail ID | example: `0`
      - `item_group_id` (`number`) - Item Group ID | example: `20`
      - `promotion_price` (`string`) - Promotion Price | example: `300000`
      - `item_group_name` (`string`) - Item Group Name | example: `Gembok anti maling warna HITAM`
      - `price` (`string`) - Item Price | example: `399000`
      - `item_id` (`number`) - Item ID | example: `1`
      - `item_code` (`string`) - Item code
      - `item_short_name` (`string`) - Item short name | example: `Item 1`

### Schema: `getInventoryStockOpnameItemsFilteredResponse`

- **Type**: `array`
- **Item properties** (13):
  - `item_id` (`number`) - Item ID | example: `1`
  - `item_full_name` (`string`) - Item Full Name | example: `SAR-TAN-BAG-BAN-HIJ - SARUNG TANGAN BAGUS BANGET - Hijau`
  - `bin_id` (`number`) - Bin ID | example: `1`
  - `bin_final_code` (`string`) - Bin Final Code | example: `LX-BX-KX-RX-1`
  - `serial_no` (`string`) - Serial No.
  - `batch_no` (`string`) - Batch No.
  - `qty_system` (`number`) - Quantity System | example: `900`
  - `qty` (`number`) - Quantity | example: `0`
  - `qty_diff` (`number`) | example: `900`
  - `use_serial_number` (`boolean`) | example: `False`
  - `use_batch_number` (`boolean`) | example: `False`
  - `expired_date` (`string`)
  - `has_expired_date` (`boolean`) | example: `False`

### Schema: `adjustmentAmountRequest`

- **Type**: `object`
- **Required fields**: `item_adj_id`, `is_opening_balance`, `item_adj_no`, `transaction_date`, `items`
- **Properties** (6):
  - `adjustment_type` (`number`) - Adjustment Type for Amount is 1 | example: `1`
  - `item_adj_id` (`number`) - Adjustment ID <br>
To create new adjustment => "item_adj_id": 0 <br>
To edit adjustment => "item_adj_id": {item_adj_id}
 | example: `0`
  - `item_adj_no` (`string`) - Adjustment Number <br>
To create new adjustment => "item_adj_no": "[auto]" <br>
To edit adjustment => "item_adj_no": {item_adj_no}
 | example: `[auto]`
  - `transaction_date` (`string`) - Adjustment Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `note` (`string`) - Adjustment Note | example: `Saldo Awal Persediaan`
  - `items` (`array of object`)
    - **Array item properties** (7):
      - `item_adj_detail_id` (`number`) - Adjustment Detail ID [0 = create] | example: `0`
      - `item_id` (`number`) - Item Adjustment ID | example: `1`
      - `cost` (`string`) - Item Cost | example: `100`
      - `amount` (`number`) - Item Cost Amount | example: `100000`
      - `account_id` (`number`) - User Account that do the Adjustment [default is 75] | example: `75`
      - `description` (`string`) - Item Description | example: `Item Example Description`
      - `unit` (`string`) - Unit Name | example: `Buah`

### Schema: `getBrandsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (2):
      - `brand_id` (`number`) - Brand ID | example: `3`
      - `brand_name` (`string`) - Brand Name | example: `24K`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `itemsTransfers`

- **Type**: `array`
- **Item properties** (10):
  - `item_transfer_detail_id` (`number`) - Fill 0 to create | example: `0`
  - `item_id` (`number`) - Item ID | example: `65476`
  - `description` (`string`) - Item Description, usually exist in item_full_name
  - `unit` (`string`) | example: `Buah`
  - `qty_in_base` (`number`) - the quantity of items that needs to receive. | example: `1`
  - `bin_id` (`number`) - Bin ID | example: `3`
  - `serial_no` (`string`) - Item Serial Number
  - `batch_no` (`string`) - Item Batch Number
  - `source_location_id` (`number`) - Source Location ID | example: `5`
  - `destination_location_id` (`number`) - Destination Location ID. Can't be same with Source Location ID | example: `1`

### Schema: `inventoryTransferRequest`

- **Type**: `object`
- **Required fields**: `destination_location_id`, `item_transfer_no`, `source_location_id`, `transfer_type`
- **Properties** (11):
  - `item_transfer_id` (`number`) - Transfer ID <br>
To create new transfer => "item_transfer_id": 0 <br>
To edit transfer => "item_transfer_id": {item_transfer_id}
 | example: `0`
  - `item_transfer_no` (`string`) - Transfer Number <br>
To create new transfer => "item_transfer_no": "[auto]" <br>
To edit transfer => "item_transfer_no": {item_transfer_no}
 | example: `[auto]`
  - `transaction_date` (`string`) - Transfer Transaction Date | example: `2020-01-06T01:49:21.999Z`
  - `created_date` (`string`) - Record Created Date | example: `2020-01-06T01:49:21.999Z`
  - `note` (`string`) - Transfer Note | example: `Transfer Request Example`
  - `source_location_id` (`number`) - Source Location ID | example: `5`
  - `destination_location_id` (`number`) - Destination Location ID. Can't be same with Source Location ID | example: `1`
  - `source_transfer_no` (`string`) - Source Transfer Number
  - `is_internal` (`boolean`) - Whether or not stock transfer is within 1 location (internal) | example: `False`
  - `items` (ref: `itemsTransfers`)
  - `transfer_type` (`number`) - Transfer Type <br>
0 => Transfer Out <br>
1 => Tranfer In
 | example: `0`

### Schema: `getInventoryTransferResponse`

- **Type**: `object`
- **Properties** (13):
  - `item_transfer_id` (`number`) - Transfer ID | example: `0`
  - `item_transfer_no` (`string`) - Transfer Number | example: `[auto]`
  - `transaction_date` (`string`) - Transfer Transaction Date | example: `2020-01-06T01:49:21.999Z`
  - `created_date` (`string`) - Record Created Date | example: `2020-01-06T01:49:21.999Z`
  - `received_date` (`string`) - Transfer Received Date | example: `2020-01-06T01:49:21.999Z`
  - `note` (`string`) - Transfer Note | example: `Transfer Request Example`
  - `source_location_id` (`number`) - Source Location ID | example: `-1`
  - `destination_location_id` (`number`) - Destination Location ID. Can't be same with Source Location ID | example: `1`
  - `transfer_type` (`number`) - Transfer Type | example: `0`
  - `source_transfer_no` (`string`) - Source Transfer No | example: `TR0001`
  - `created_by` (`string`) - Created date
  - `printed_by` (`string`) - Printed by
  - `items` (`array of object`)
    - **Array item properties** (6):
      - `item_transfer_detail_id` (`number`) - Item Transfer Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `4`
      - `serial_no` (`string`) - Serial Number | example: `SN001`
      - `qty_in_base` (`number`) - Item Quantity that will be transfer | example: `1`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `description` (`string`) - Item Description | example: `Item Transfer Request Example`

### Schema: `getInventoryTransferInResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (18):
      - `created_by` (`string`) - Created By | example: `support@jubelio.com`
      - `created_date` (`string`) - Created date | example: `2020-09-07T07:39:41.303Z`
      - `destination` (`string`) - Destination of the transfer | example: `Jogja`
      - `destination_location_id` (`number`) - The Id of location destination | example: `15`
      - `is_printed` (`boolean`) - Is the record printed | example: `False`
      - `item_transfer_id` (`number`) - The Id of item transfer | example: `343`
      - `item_transfer_no` (`string`) - The number of item transfer | example: `TRF-000000343`
      - `note` (`string`) - The note | example: `Please handle with care.`
      - `printed_by` (`string`) - Name that does print | example: `Support`
      - `received_by` (`string`) - The receiver name | example: `Support`
      - `received_date` (`string`) - Date when the transfer is received | example: `2020-09-07T07:39:41.303Z`
      - `return_id` (`number`) - The return id. (null if there is no)
      - `source` (`string`) - The source of the transfer | example: `Pusat`
      - `source_location_id` (`number`) - The Id of source location | example: `-1`
      - `source_transfer_no` (`number`) - The number of source transfer. (null of there is no)
      - `transaction_date` (`string`) - the transaction date | example: `2020-09-07T07:39:12.530Z`
      - `transfer_type` (`number`) - the type of transfer in code/number | example: `0`
      - `updated_by` (`string`) - Updated by | example: `support@jubelio.com`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getInventoryTransfersAllTransitResponses`

- **Type**: `array`
- **Item properties** (14):
  - `item_transfer_id` (`number`) - Item Transfer ID | example: `5373`
  - `item_transfer_no` (`string`) - Item Transfer No. | example: `TRFO-000005373`
  - `source` (`string`) - Source Location | example: `Gedung Besar`
  - `destination` (`string`) - Destination Location | example: `Gedung Kecil`
  - `is_printed` (`boolean`) | example: `True`
  - `source_location_id` (`number`) | example: `1`
  - `destination_location_id` (`number`) | example: `-1`
  - `transaction_date` (`string`) | example: `2021-12-21T06:36:09.334Z`
  - `qty` (`number`) | example: `100`
  - `from_no` (`number`) | example: `100`
  - `to_no` (`number`) | example: `100`
  - `percentage` (`number`) - Progress of items that already received | example: `100`
  - `button_msg` (`string`) | example: `Terima`
  - `receive_tf_no` (`string`) | example: `TRFI-000005374`

### Schema: `getInventoryTransferOutResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (23):
      - `created_by` (`string`) - Created By | example: `support@jubelio.com`
      - `created_date` (`string`) - Created date | example: `2020-09-07T07:39:41.303Z`
      - `destination` (`string`) - Destination of the transfer | example: `Jogja`
      - `transactionDateFrom` (`string`)
      - `transactionDateTo` (`string`)
      - `locIds` (`string`) | example: `1`
      - `destination_location_id` (`number`) - The Id of location destination | example: `15`
      - `is_printed` (`boolean`) - Is the record printed | example: `False`
      - `item_transfer_id` (`number`) - The Id of item transfer | example: `343`
      - `item_transfer_no` (`string`) - The number of item transfer | example: `TRF-000000343`
      - `note` (`string`) - The note | example: `Please handle with care.`
      - `printed_by` (`string`) - Name that does print | example: `Support`
      - `received_by` (`string`) - The receiver name | example: `Support`
      - `received_date` (`string`) - Date when the transfer is received | example: `2020-09-07T07:39:41.303Z`
      - `return_id` (`number`) - The return id. (null if there is no)
      - `source` (`string`) - The source of the transfer | example: `Pusat`
      - `source_location_id` (`number`) - The Id of source location | example: `-1`
      - `source_transfer_no` (`number`) - The number of source transfer. (null of there is no)
      - `transaction_date` (`string`) - the transaction date | example: `2020-09-07T07:39:12.530Z`
      - `transfer_type` (`number`) - the type of transfer in code/number | example: `0`
      - `updated_by` (`string`) - Updated by | example: `support@jubelio.com`
      - `auto_placement` (`boolean`) - If Item is going auto-placement | example: `True`
      - `is_replenishment` (`boolean`) | example: `False`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getInventoryTransfersOutFinishedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (22):
      - `created_by` (`string`) - Created By | example: `support@jubelio.com`
      - `created_date` (`string`) - Created date | example: `2020-09-07T07:39:41.303Z`
      - `destination` (`string`) - Destination of the transfer | example: `Jogja`
      - `destination_location_id` (`number`) - The Id of location destination | example: `15`
      - `is_printed` (`boolean`) - Is the record printed | example: `False`
      - `item_transfer_id` (`number`) - The Id of item transfer | example: `343`
      - `item_transfer_no` (`string`) - The number of item transfer | example: `TRF-000000343`
      - `note` (`string`) - The note | example: `Please handle with care.`
      - `printed_by` (`string`) - Name that does print | example: `Support`
      - `received_by` (`string`) - The receiver name | example: `Support`
      - `received_date` (`string`) - Date when the transfer is received | example: `2020-09-07T07:39:41.303Z`
      - `return_id` (`number`) - The return id. (null if there is no)
      - `source` (`string`) - The source of the transfer | example: `Pusat`
      - `source_location_id` (`number`) - The Id of source location | example: `-1`
      - `source_transfer_no` (`number`) - The number of source transfer. (null of there is no)
      - `transaction_date` (`string`) - the transaction date | example: `2020-09-07T07:39:12.530Z`
      - `transfer_type` (`number`) - the type of transfer in code/number | example: `0`
      - `updated_by` (`string`) - Updated by | example: `support@jubelio.com`
      - `auto_placement` (`boolean`) - If Item is going auto-placement | example: `True`
      - `is_replenishment` (`boolean`) | example: `False`
      - `received_transfer_no` (`string`) - Received Transfer No. | example: `TRFI-000005393`
      - `received_transfer_id` (`number`) - Received Transfer ID | example: `5393`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getInventoryTransfersTransitResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (20):
      - `created_by` (`string`) - Created By | example: `support@jubelio.com`
      - `created_date` (`string`) - Created date | example: `2020-09-07T07:39:41.303Z`
      - `destination` (`string`) - Destination of the transfer | example: `Jogja`
      - `destination_location_id` (`number`) - The Id of location destination | example: `15`
      - `is_printed` (`boolean`) - Is the record printed | example: `False`
      - `item_transfer_id` (`number`) - The Id of item transfer | example: `343`
      - `item_transfer_no` (`string`) - The number of item transfer | example: `TRF-000000343`
      - `note` (`string`) - The note | example: `Please handle with care.`
      - `printed_by` (`string`) - Name that does print | example: `Support`
      - `received_by` (`string`) - The receiver name | example: `Support`
      - `received_date` (`string`) - Date when the transfer is received | example: `2020-09-07T07:39:41.303Z`
      - `return_id` (`number`) - The return id. (null if there is no)
      - `source` (`string`) - The source of the transfer | example: `Pusat`
      - `source_location_id` (`number`) - The Id of source location | example: `-1`
      - `source_transfer_no` (`number`) - The number of source transfer. (null of there is no)
      - `transaction_date` (`string`) - the transaction date | example: `2020-09-07T07:39:12.530Z`
      - `transfer_type` (`number`) - the type of transfer in code/number | example: `0`
      - `updated_by` (`string`) - Updated by | example: `support@jubelio.com`
      - `auto_placement` (`boolean`) - If Item is going auto-placement | example: `True`
      - `is_replenishment` (`boolean`) | example: `False`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getInventoryTransferDeliveryResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) | example: `ok`
  - `url` (`string`) | example: `https://report3.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Surat Jalan WMS`

### Schema: `saveImageRequestNew`

- **Type**: `object`
- **Required fields**: `file`, `uid`, `name`
- **Properties** (4):
  - `file` (`string`) - Image File
  - `name` (`string`) - Image Name | example: `Termurah__Rice_Cooker_Miyako_Mcm_606_A___Magic_Com_06l___Pen.jpg`
  - `TotalFileSize` (`number`) - Image Total File Size (Optional) | example: `49741`
  - `uid` (`string`) - Image ID | example: `636d4589-f8b3-4271-aa96-403d11ce3a6f`

### Schema: `saveImageResponse`

- **Type**: `object`
- **Properties** (4):
  - `success` (`boolean`) - Is Success | example: `True`
  - `name` (`string`) - Image Name | example: `Termurah__Rice_Cooker_Miyako_Mcm_606_A___Magic_Com_06l___Pen.jpg`
  - `key` (`string`) - Image URL | example: `https://jubelio.blob.core.windows.net/images/bngb2liirsoobzqmj73egg/636d4589-f8b`
  - `thumbnail` (`string`) - Image Thumbnail URL | example: `https://jubelio.blob.core.windows.net/images/bngb2liirsoobzqmj73egg/636d4589-f8b`

### Schema: `getInventoryItemsbyBillResponse`

- **Type**: `array`
- **Item properties** (16):
  - `item_id` (`number`) - Item ID | example: `57366`
  - `item_code` (`string`) - Item Code | example: `TRB-01/PURPLE-M`
  - `item_name` (`string`) - Item Name | example: `Topi Turban Pita Bayi Anak Perempuan Turban Kerudung Bayi Anak Perempuan Kupluk `
  - `bill_detail_id` (`number`) - Bill Detail ID | example: `37836`
  - `rate` (`string`) - Rate | example: `10`
  - `tax_name` (`string`) - Tax Name | example: `PPN`
  - `account_code` (`string`) - account code | example: `1-1200`
  - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`
  - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
  - `qty_in_base` (`string`) - Quantity of items that wants to return | example: `5`
  - `average_cost` (`number`) - Average Cost | example: `99998`
  - `buy_price` (`number`) - Buy Price | example: `100000`
  - `buy_unit` (`string`) - Unit | example: `Buah`
  - `buy_tax_id` (`number`) - Buy Tax ID | example: `1`
  - `item_full_name` (`string`) - Item Full Name | example: `TRB-01/PURPLE-M - Topi Turban Pita Bayi Anak Perempuan Turban Kerudung Bayi Anak`
  - `is_consignment` (`boolean`) - If product is consigment product | example: `False`

### Schema: `ItemsAutoPutawayRequest`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List of Bill ID that needs to be putaway & location to placed the items.
    - **Array item properties** (4):
      - `location_id` (`string`) - Warehouse Location | example: `1`
      - `bill_id` (`array of number`)
      - `transfer_id` (`array of number`)
      - `return_id` (`array of number`)

### Schema: `getInventoryItemsItemOnStockResponse`

- **Type**: `array`
- **Item properties** (9):
  - `item_id` (`number`) - Item ID | example: `57366`
  - `item_code` (`string`) - Item Code | example: `TRB-01/PURPLE-M`
  - `item_name` (`string`) - Item Name | example: `Topi Turban Pita Bayi Anak Perempuan Turban Kerudung Bayi Anak Perempuan Kupluk `
  - `order_qty` (`number`) - Order QTY | example: `10`
  - `end_qty` (`number`) | example: `10`
  - `available_qty` (`number`) | example: `10`
  - `item_full_name` (`string`) - Item Full Name | example: `TRB-01/PURPLE-M - Topi Turban Pita Bayi Anak Perempuan Turban Kerudung Bayi Anak`
  - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
  - `buy_unit` (`string`) | example: `Buah`

### Schema: `getJournalResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (8):
      - `credit` (`string`) - Credit | example: `1300000.0000`
      - `debit` (`string`) - Debit | example: `1300000.0000`
      - `journal_id` (`number`) - Journal Id | example: `5615`
      - `journal_no` (`string`) - Journal Number | example: `GJ-0005615`
      - `journal_type` (`string`) - The type of journal. Could be 'Manual Jurnal' or null
      - `notes` (`string`) - Journal Note
      - `source_doc_no` (`string`) - The source of document | example: `ADJS-000001428`
      - `transaction_date` (`string`) - The transaction date | example: `2020-07-24T07:33:46.357Z`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getJournalByIdResponse`

- **Type**: `object`
- **Properties** (7):
  - `journal_id` (`number`) - Journal Id | example: `5506`
  - `journal_no` (`string`) - Journal Number | example: `GJ-0005615`
  - `journal_type` (`string`) - The type of journal. Could be 'Manual Jurnal' or null
  - `notes` (`string`) - Journal Note | example: `test2`
  - `source_doc_no` (`string`) - The source of document | example: `ADJS-000001552`
  - `transaction_date` (`string`) - The transaction date | example: `2020-07-24T07:33:46.357Z`
  - `accounts` (`array of object`) - List Items that exists in System
    - **Array item properties** (6):
      - `account_id` (`number`) - The account Id | example: `4`
      - `account_name` (`string`) - The account Name | example: `1-1200 - Persediaan Barang`
      - `credit` (`string`) - The credit | example: `0.0000`
      - `debit` (`string`) - Debit | example: `1000.0000`
      - `description` (`string`) - The description of the journal
      - `journal_detail_id` (`number`) - The journal detail Id | example: `21353`

### Schema: `saveManualJournalRequest`

- **Type**: `object`
- **Required fields**: `picklist_id`, `picklist_no`, `is_completed`, `accounts`
- **Properties** (5):
  - `journal_id` (`number`) - Journal Id <br>
To create new journal => "journal_id": 0 <br>
To edit journal => "journal_id": {journal_id}
 | example: `0`
  - `notes` (`string`) - The Notes
  - `source_doc_no` (`string`) - The Source of number document | example: `-1`
  - `transaction_date` (`string`) - The transaction date | example: `2020-07-29T07:15:33.768`
  - `accounts` (`array of object`) - List Item in Accounts
    - **Array item properties** (5):
      - `account_id` (`number`) - Account Id | example: `5`
      - `credit` (`number`) - Credit | example: `1000`
      - `debit` (`number`) - Debit | example: `0`
      - `description` (`string`) - The description | example: `Example`
      - `journal_detail_id` (`number`) - Journal detail Id | example: `0`

### Schema: `getLocationsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (29):
      - `location_id` (`number`) - Location ID | example: `1`
      - `location_name` (`string`) - Location Name | example: `Kutabumi`
      - `is_pos_outlet` (`boolean`) - Is Location a POS Outlet | example: `False`
      - `address` (`string`) - Location Full Address | example: `Jl. Raya Kutabumi Ruko Pondok Permai blok CA 1 no 6, Kutabaru, Pasar Kemis, Tang`
      - `city` (`string`) - Location Address City | example: `Tangerang`
      - `phone` (`string`) - Location Contact Number | example: `215442490`
      - `email` (`string`) - Location Contact Email | example: `kutabumi.warehouse@example.com`
      - `province` (`string`) - Location Address Province | example: `Banten`
      - `post_code` (`string`) - Location Address Post Code | example: `15560`
      - `is_fbl` (`boolean`) - Is Location a FBL
      - `is_tcb` (`boolean`) - Is Location a TCB
      - `location_code` (`string`) - Location code
      - `area` (`string`) - Location code
      - `warehouse_id` (`string`) - Warehouse ID
      - `warehouse_store_id` (`string`) - Warehouse Store ID
      - `pos_discount` (`number`) - Discount Value. | example: `10`
      - `pos_discount_type` (`number`) - Discount Type. Describe as 1 = percentage, 2 = real price/value. | example: `1`
      - `pos_email_struct_id` (`number`) | example: `-1`
      - `pos_struct_id` (`number`) | example: `-1`
      - `pos_tax` (`number`) | example: `1`
      - `is_active` (`boolean`) | example: `True`
      - `pos_discount_max` (`number`) - Maximum discount that applies when using a percentage. | example: `25000`
      - `is_sbs` (`boolean`) | example: `False`
      - `is_multi_origin` (`boolean`) | example: `True`
      - `is_warehouse` (`boolean`) | example: `True`
      - `wms_migration_date` (`string`) | example: `2021-09-28T06:49:05.851Z`
      - `default_warehouse_user` (`string`) - email PIC of the Warehouse | example: `wms222@gmail.com`
      - `source_replenishment` (`number`) | example: `1`
      - `location_type` (`string`) | example: `Gudang`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `stores`

- **Type**: `array`

### Schema: `registers`

- **Type**: `array`
- **Item properties** (2):
  - `register_id` (`number`) - Register ID | example: `0`
  - `register_name` (`string`) - Register Name | example: `Denis`

### Schema: `layout`

- **Type**: `object`
- **Properties** (2):
  - `floors` (`array of object`)
    - **Array item properties** (3):
      - `id` (`number`) - Automatically generated. but to create new, you can fill with 0 | example: `0`
      - `text` (`string`) | example: `L1`
      - `rows` (`array of object`)
  - `delete` (`object`)
    - `floors` (`array of object`)
    - `rows` (`array of object`)
    - `columns` (`array of object`)
    - `bins` (`array of object`)

### Schema: `saveLocationRequest`

- **Type**: `object`
- **Required fields**: `location_id`, `location_name`, `stores`, `registers`
- **Properties** (24):
  - `location_id` (`number`) - Location ID <br>
To create new location => "location_id": 0 <br>
To edit location => "location_id": {location_id}
 | example: `1`
  - `location_name` (`string`) - Location Name (Unique) | example: `Kutabumi`
  - `location_code` (`string`) - Location code
  - `is_pos_outlet` (`boolean`) - Is Location a POS Outlet | example: `True`
  - `address` (`string`) - Location Full Address | example: `Jl. Raya Kutabumi Ruko Pondok Permai blok CA 1 no 6, Kutabaru, Pasar Kemis, Tang`
  - `phone` (`string`) - Location Contact Number | example: `215442490`
  - `province` (`string`) - Location Address Province | example: `Banten`
  - `area` (`string`) - Area | example: `Tangerang`
  - `post_code` (`string`) - Location Address Post Code | example: `15560`
  - `city` (`string`) - Location Address City | example: `Tangerang`
  - `email` (`string`) - Location Contact Email | example: `kutabumi.warehouse@example.com`
  - `is_fbl` (`boolean`) - Is Location a FBL | example: `False`
  - `is_tcb` (`boolean`) - Is Location a TCB | example: `False`
  - `is_sbs` (`boolean`) - . | example: `False`
  - `is_warehouse` (`boolean`) - If the location is also used as a warehouse. | example: `True`
  - `is_multi_origin` (`boolean`) - If the location can be assigned to fulfill orders from customers which location is nearby the warehouse (Only works for Jubelio Store's Customer) | example: `False`
  - `stores` (ref: `stores`)
  - `warehouse_id` (`number`) - Warehouse ID
  - `warehouse_store_id` (`number`) - Warehouse Store ID
  - `is_active` (`boolean`) - If the location is active as warehouse to fulfill orders | example: `False`
  - `default_warehouse_user` (`string`) - Email of jubelio user who is going to be set as a default warehouse staff | example: `juberlians@jubelio.com`
  - `source_replenishment` (`number`) | example: `8`
  - `registers` (ref: `registers`)
  - `layout` (ref: `layout`)

### Schema: `getLocationResponse`

- **Type**: `object`
- **Properties** (31):
  - `location_id` (`number`) - Location ID | example: `1`
  - `location_name` (`string`) - Location Name | example: `Kutabumi`
  - `is_pos_outlet` (`boolean`) - Is Location a POS Outlet | example: `False`
  - `address` (`string`) - Location Full Address | example: `Jl. Raya Kutabumi Ruko Pondok Permai blok CA 1 no 6, Kutabaru, Pasar Kemis, Tang`
  - `city` (`string`) - Location Address City | example: `Tangerang`
  - `phone` (`string`) - Location Contact Number | example: `215442490`
  - `email` (`string`) - Location Contact Email | example: `kutabumi.warehouse@example.com`
  - `province` (`string`) - Location Address Province | example: `Banten`
  - `post_code` (`string`) - Location Address Post Code | example: `15560`
  - `is_fbl` (`boolean`) - Is Location a FBL | example: `False`
  - `location_code` (`string`) - Location Code | example: `Gudang Besar`
  - `area` (`string`) - area | example: `Tebet`
  - `is_tcb` (`boolean`) | example: `False`
  - `warehouse_id` (`string`)
  - `warehouse_store_id` (`string`)
  - `pos_discount` (`number`)
  - `pos_discount_type` (`string`)
  - `pos_email_struct_id` (`string`) | example: `-1`
  - `pos_struct_id` (`string`) | example: `-1`
  - `pos_tax` (`string`) | example: `1`
  - `is_active` (`boolean`) | example: `True`
  - `pos_discount_max` (`number`)
  - `is_sbs` (`boolean`) | example: `False`
  - `is_multi_origin` (`boolean`) | example: `False`
  - `is_warehouse` (`boolean`) | example: `True`
  - `wms_migration_date` (`string`)
  - `default_warehouse_user` (`string`)
  - `source_replenishment_name` (`string`)
  - `registers` (`string`)
  - `stores` (`string`)
  - `layout` (`object`)
    - `floors` (`array of object`)

### Schema: `getBinByLocationIDResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Bin ID based on Location ID
    - **Array item properties** (11):
      - `bin_id` (`string`) - Bin ID | example: `147`
      - `location_id` (`string`) - Location ID | example: `1`
      - `floor_id` (`string`) - Floor ID | example: `3`
      - `row_id` (`string`) - Row ID | example: `3`
      - `column_id` (`string`) - Column ID | example: `3`
      - `bin_code` (`string`) - Bin Code | example: `11111`
      - `bin_final_code` (`string`) - Complete Bin Code | example: `11111`
      - `max_qty` (`number`) - Maximum Quantity | example: `200000`
      - `acknowledge_stock` (`boolean`) - stock in those bin is recognize and can be sold on the sales channel | example: `True`
      - `is_default` (`boolean`)
      - `is_inbound` (`boolean`) - If the bin is used only for inbound place | example: `False`
  - `totalCount` (`number`) - total count of all data | example: `110`

### Schema: `getLocationStoresResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (4):
      - `store_id` (`string`) - Store ID | example: `1`
      - `store_name` (`string`) - Store Name | example: `Kutabumi`
      - `location_id` (`number`) - Location ID | example: `1`
      - `channel_id` (`number`) - Channel ID | example: `1`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `loginRequest`

- **Type**: `object`
- **Required fields**: `email`, `password`
- **Properties** (2):
  - `email` (`string`) - Registered Email in system | example: `user@example.com`
  - `password` (`string`) - Password for login authentication | example: `password`

### Schema: `loginResponse`

- **Type**: `object`
- **Properties** (9):
  - `token` (`string`) - Authentication Token.
Use this token for your subsequent calls to other end points
 | example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InZvdzIybzZjdDNjaTdnbXd5ZWZ0MXciLCJ`
  - `passwordExpired` (`string`) - Password has expired | example: `False`
  - `userName` (`string`) - User Login Email | example: `user@example.com`
  - `roles` (`array of object`) - List Role ID of Authenticated User
    - **Array item properties** (1):
      - `role_id` (`string`) - Role ID | example: `-1`
  - `packageId` (`number`) - User Package ID | example: `2`
  - `trialLeft` (`number`) - User Trial Left Time | example: `0`
  - `showGettingStarted` (`boolean`) - Show Getting Started when User Login | example: `True`
  - `currentCompany` (`number`) - User Current Company ID | example: `10`
  - `companies` (`array of object`) - List Authenticated User Companies
    - **Array item properties** (2):
      - `company_id` (`number`) - Company Name | example: `10`
      - `company_name` (`string`) - Company Name | example: `default`

### Schema: `loginError`

- **Type**: `object`
- **Properties** (4):
  - `statusCode` (`string`) - Error Status Code | example: `500`
  - `error` (`string`) - Error Title | example: `Internal Server Error`
  - `message` (`string`) - Error Message | example: `An internal server error occurred`
  - `code` (`string`) - Error Code | example: `Invalid email or password`

### Schema: `getAllStoresResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (6):
      - `channel_id` (`number`) - Channel ID | example: `1`
      - `store_id` (`string`) - Store ID | example: `1`
      - `store_name` (`string`) - Store Name | example: `Jubelio`
      - `extra_info` (`object`) - Store Extra Info
      - `channel_user_id` (`string`) - Channel User ID | example: `ck_f32377ac8c68fa9081`
      - `channel_user_secret` (`boolean`) - Channel User Secret | example: `cs_751447bb22ad60a278dfb5a3`

### Schema: `getBillsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (15):
      - `doc_id` (`number`) - Document ID | example: `3`
      - `doc_number` (`string`) - Document Number | example: `BIL-000000001`
      - `contact_id` (`number`) - Contact ID | example: `3`
      - `supplier_name` (`string`) - Bill Number | example: `PT.ANYWAY`
      - `transaction_date` (`string`) - Bill Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `due_date` (`number`) | example: `20`
      - `is_opening_balance` (`boolean`) - Is Bill a Opening Balance | example: `False`
      - `grand_total` (`string`) - Bill Grand Total | example: `50000`
      - `due` (`string`) - Bill Due Payment | example: `0`
      - `doc_type` (`string`) - Document Type | example: `bill`
      - `age` (`number`) - Bill Age | example: `83`
      - `age_due` (`number`) - Bill Due Age | example: `83`
      - `serial_number` (`string`) - Serial Number | example: `BSHH121848`
      - `purchaseorder_id` (`number`) - Purchase order ID
      - `downpayment_amount` (`number`) - Downpayment amount
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveBillRequest`

- **Type**: `object`
- **Required fields**: `bill_no`, `due_date`, `is_opening_balance`, `location_id`, `supplier_name`
- **Properties** (20):
  - `bill_id` (`number`) - Bill ID | example: `0`
  - `bill_no` (`string`) - Bill Number | example: `[auto]`
  - `contact_id` (`number`) - Contact ID | example: `5`
  - `supplier_name` (`string`) - Supplier Name | example: `BLANJA`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-11-19T19:37:56.176Z`
  - `due_date` (`string`) - Due Date | example: `2018-11-19T19:37:56.176Z`
  - `is_tax_included` (`boolean`) - Whether Bill include Tax | example: `False`
  - `note` (`string`) - Bill Note | example: `Penerimaan Barang yang sudah dipesan`
  - `sub_total` (`number`) - Bill Sub Total | example: `20000`
  - `total_disc` (`number`) - Total Discount | example: `0`
  - `total_tax` (`number`) - Total Tax | example: `0`
  - `grand_total` (`number`) - Bill Grand Total | example: `20000`
  - `payment_acct_id` (`number`) - Payment Account ID | example: `False`
  - `payment` (`number`) - Payment | example: `0`
  - `ref_no` (`string`) - Reference No | example: `123654`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `is_opening_balance` (`boolean`) - If bill is for Opening Balance | example: `False`
  - `purchaseorder_id` (`number`) - Purchase Order Id | example: `20`
  - `auto_placement` (`boolean`) - If you want to automatically place the products on the default rack | example: `False`
  - `items` (`array of object`)
    - **Array item properties** (16):
      - `bill_detail_id` (`number`) - Bill Detail ID | example: `0`
      - `purchaseorder_detail_id` (`number`) - Purchase Order Detail Id | example: `30`
      - `item_id` (`number`) - Item ID | example: `7`
      - `description` (`string`) - Item Description | example: `Aqua 1,5 L`
      - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
      - `tax_id` (`number`) - Tax ID | example: `-1`
      - `price` (`number`) - Item Price | example: `4000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be add | example: `5`
      - `serialno` (`array of string`)
      - `batchno` (`array of string`)
      - `disc` (`number`) - Discount | example: `0`
      - `disc_amount` (`number`) - Total Discount Amount | example: `0`
      - `tax_amount` (`number`) - Tax Amount | example: `0`
      - `amount` (`number`) - Total Amount | example: `20000`
      - `location_id` (`number`) - Location ID | example: `-1`

### Schema: `getPurchaseBillsForReturnResponse`

- **Type**: `array`
- **Item properties** (15):
  - `doc_id` (`number`) - Document ID | example: `2`
  - `doc_number` (`string`) - Document Number | example: `BIL-000007087`
  - `contact_id` (`number`) - Contact ID (Supplier) | example: `2`
  - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTYANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `purchaseorder_id` (`string`) - Purchase Order ID
  - `due_date` (`number`) - Due Date | example: `20`
  - `is_opening_balance` (`boolean`) - Whether Transaction is an Opening Balance | example: `False`
  - `grand_total` (`string`) - Grand Total | example: `1300000`
  - `due` (`string`) - Payment Due | example: `0`
  - `downpayment_amount` (`number`) | example: `0`
  - `doc_type` (`string`) - Document Type | example: `bill`
  - `age` (`number`) - Purchase Return Age | example: `336`
  - `age_due` (`number`) - Purchase Return Due Age | example: `337`
  - `is_consignment` (`boolean`) - If product is a consignment product or not | example: `False`

### Schema: `getBillResponse`

- **Type**: `object`
- **Properties** (23):
  - `bill_id` (`number`) - Bill ID | example: `0`
  - `bill_no` (`string`) - Bill Number | example: `[auto]`
  - `contact_id` (`number`) - Contact ID | example: `5`
  - `purchaseorder_id` (`number`) - Purchase Order ID | example: `2`
  - `purchaseorder_no` (`number`) - Purchase Order Number | example: `PO-000000004`
  - `supplier_name` (`string`) - Supplier Name | example: `PT.ANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-11-19T19:37:56.176Z`
  - `created_date` (`string`) - Created Date | example: `2018-11-19T19:37:56.176Z`
  - `due_date` (`number`) - Due Date | example: `2018-11-19T19:37:56.176Z`
  - `is_tax_included` (`boolean`) - Whether Bill include Tax | example: `False`
  - `note` (`string`) - Bill Note | example: `Penerimaan Barang yang sudah dipesan`
  - `sub_total` (`number`) - Bill Sub Total | example: `20000`
  - `total_disc` (`number`) - Total Discount | example: `0`
  - `total_tax` (`number`) - Total Tax | example: `0`
  - `grand_total` (`number`) - Bill Grand Total | example: `20000`
  - `payment_acct_id` (`number`) - Payment Account ID | example: `False`
  - `payment` (`number`) - Payment | example: `0`
  - `ref_no` (`string`) - Reference No | example: `123654`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `location_name` (`number`) - Location Name | example: `Pusat`
  - `is_opening_balance` (`boolean`) - Whether Bill for Opening Balance | example: `False`
  - `last_modified` (`string`) - Last modified
  - `items` (`array of object`)
    - **Array item properties** (25):
      - `bill_detail_id` (`number`) - Bill Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `7`
      - `item_code` (`string`) - Item Code | example: `10000631`
      - `item_name` (`string`) - Item Name | example: `Aqua 1,5 L`
      - `description` (`string`) - Item Description | example: `Aqua 1,5 L`
      - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
      - `tax_id` (`number`) - Tax ID | example: `-1`
      - `price` (`number`) - Item Price | example: `4000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be add | example: `5`
      - `qty` (`string`) - Item Quantity | example: `0`
      - `uom_id` (`number`) - Unit of Measure ID | example: `-1`
      - `disc` (`number`) - Discount | example: `0`
      - `disc_amount` (`number`) - Total Discount Amount | example: `0`
      - `tax_amount` (`number`) - Tax Amount | example: `0`
      - `amount` (`number`) - Total Amount | example: `20000`
      - `buy_price` (`string`) - Item Buy Price | example: `750`
      - `original_price` (`string`) - Item Original Price | example: `350`
      - `rate` (`string`) - Rate | example: `0`
      - `tax_name` (`string`) - Tax Name | example: `No Tax`
      - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`
      - `use_serial_number` (`boolean`) - Whether use Serial Number | example: `False`
      - `is_serialnumber_printed` (`boolean`) - Is Serial Number Printed | example: `False`
      - `purchaseorder_detail_id` (`number`) - Purchase order detail ID
      - `use_batch_number` (`boolean`) - .

### Schema: `getPurchaseOrdersResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (19):
      - `purchaseorder_id` (`number`) - Purchase Order ID | example: `1`
      - `purchaseorder_no` (`string`) - Purchase Order Number | example: `PO-000000001`
      - `contact_id` (`number`) - Contact (Supplier) ID | example: `2`
      - `supplier_name` (`number`) - Supplier Name | example: `PTANYWAY`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
      - `created_date` (`string`) - Created Date | example: `2018-10-03T05:00:00.000Z`
      - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
      - `note` (`string`) - Purchase Order Note | example: `Note`
      - `sub_total` (`string`) - Purchase Order sub Total | example: `154000`
      - `total_disc` (`string`) - Purchase Order Total Discount | example: `0`
      - `total_tax` (`string`) - Purchase Order Total Tax | example: `0`
      - `grand_total` (`string`) - Purchase Order Grand Total | example: `154000`
      - `ref_no` (`string`) - Reference Number | example: `112233`
      - `payment_method` (`number`) - Payment Method | example: `-1`
      - `location_id` (`number`) - Location ID | example: `-1`
      - `source` (`number`) - Source | example: `1`
      - `last_modified` (`string`) - Created Date | example: `2018-10-03T05:00:00.000Z`
      - `status` (`string`) - .
      - `bills` (`string`) - .
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `savePurchaseOrderRequest`

- **Type**: `object`
- **Required fields**: `purchaseorder_no`, `source`, `supplier_name`
- **Properties** (18):
  - `purchaseorder_id` (`number`) - Purchase Order ID <br>
To create new purchase order => "purchaseorder_id": 0 <br>
To edit purchase order => "purchaseorder_id": {purchaseorder_id}
 | example: `0`
  - `purchaseorder_no` (`string`) - Purchase Order Number <br>
To create new purchase order => "purchaseorder_no": "[auto]" <br>
To edit purchase order => "purchaseorder_no": {purchaseor | example: `[auto]`
  - `contact_id` (`number`) - Contact (Supplier) ID | example: `2`
  - `supplier_name` (`string`) - Supplier Name | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2020-10-02T04:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Purchase Order Note | example: `Note`
  - `sub_total` (`number`) - Purchase Order sub Total | example: `154000`
  - `total_disc` (`number`) - Purchase Order Total Discount | example: `0`
  - `total_tax` (`number`) - Purchase Order Total Tax | example: `0`
  - `grand_total` (`number`) - Purchase Order Grand Total | example: `154000`
  - `ref_no` (`string`) - Reference Number | example: `112233`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `is_closed` (`boolean`) | example: `False`
  - `close_reason` (`string`)
  - `source` (`number`) - Source | example: `1`
  - `payment_term` (`number`)
  - `items` (`array of object`)
    - **Array item properties** (12):
      - `purchaseorder_detail_id` (`number`) - Purchase Order Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `1`
      - `description` (`string`) - Item Description | example: `-1`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `77000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be add | example: `1`
      - `disc` (`number`) - Discount | example: `5`
      - `disc_amount` (`number`) - Discount Amount | example: `3850`
      - `tax_amount` (`number`) - Tax Amount | example: `0`
      - `amount` (`number`) - Total Amount | example: `73150`
      - `location_id` (`number`) - Location ID | example: `-1`

### Schema: `getPurchaseOrderResponse`

- **Type**: `object`
- **Properties** (23):
  - `purchaseorder_id` (`number`) - Purchase Order ID | example: `0`
  - `purchaseorder_no` (`string`) - Purchase Order Number | example: `PO-000000005`
  - `bill_id` (`string`) - Bill ID | example: `31`
  - `bill_number` (`string`) - Bill No. | example: `BIL-0000031`
  - `payment_method` (`number`) - Payment Method | example: `-1`
  - `contact_id` (`number`) - Contact (Supplier) ID | example: `2`
  - `supplier_name` (`string`) - Supplier Name | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-02T04:00:00.000Z`
  - `last_modified` (`string`) - Last Modified Date | example: `2018-11-02T04:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Purchase Order Note | example: `Note`
  - `sub_total` (`string`) - Purchase Order sub Total | example: `154000`
  - `total_disc` (`string`) - Purchase Order Total Discount | example: `0`
  - `total_tax` (`string`) - Purchase Order Total Tax | example: `0`
  - `grand_total` (`string`) - Purchase Order Grand Total | example: `154000`
  - `ref_no` (`string`) - Reference Number | example: `112233`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `location_name` (`string`) - Location Name | example: `Pusat`
  - `source` (`number`) - Source | example: `1`
  - `is_closed` (`boolean`) - Is closed | example: `True`
  - `close_reason` (`string`) - Closed reason | example: `Tidak sesuai`
  - `items` (`array of object`)
    - **Array item properties** (20):
      - `purchaseorder_detail_id` (`number`) - Purchase Order Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `1`
      - `item_code` (`string`) - Item Code | example: `BTY-L`
      - `item_name` (`number`) - Item Name | example: `Kaos DreamCatcher Born to Be Yours`
      - `description` (`string`) - Item Description | example: `-1`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`string`) - Item Price | example: `77000`
      - `buy_price` (`string`) - Item Buy Price | example: `77000`
      - `original_price` (`string`) - Item Original Price | example: `77000`
      - `rate` (`string`) - Item Rate | example: `0`
      - `tax_name` (`string`) - Tax Name | example: `No Tax`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty` (`string`) - Item Quantity | example: `0`
      - `uom_id` (`number`) - Unit of Measure ID | example: `1`
      - `qty_in_base` (`number`) - Quantity that will be add | example: `1`
      - `disc` (`string`) - Discount | example: `5`
      - `disc_amount` (`string`) - Discount Amount | example: `3850`
      - `tax_amount` (`string`) - Tax Amount | example: `0`
      - `amount` (`string`) - Total Amount | example: `73150`
      - `location_id` (`number`) - Location ID | example: `-1`

### Schema: `getPurchaseOrdersProgressResponses`

- **Type**: `array`
- **Item properties** (15):
  - `purchaseorder_id` (`number`) - Purchase Order ID | example: `5479`
  - `purchaseorder_no` (`string`) - Purchase Order No. | example: `PO-000005479`
  - `contact_id` (`number`) - Contact ID | example: `30691`
  - `supplier_name` (`string`) - Supplier/vendor name in contact menu | example: `BINJAY`
  - `transaction_date` (`string`) | example: `2022-02-15T02:28:41.429Z`
  - `grand total` (`number`) - Grand Total | example: `3371200`
  - `note` (`string`)
  - `status` (`string`) | example: `ACTIVE`
  - `location_id` (`number`) | example: `1`
  - `bills` (`string`) - If bill no. already exist means this PO have been received. | example: `BIL-000009709`
  - `from_no` (`number`) | example: `20`
  - `to_no` (`number`) | example: `120`
  - `percentage` (`number`) - Percentage of how much items have been received in the warehouse. | example: `16`
  - `location_name` (`string`) | example: `Gudang BESAR`
  - `button_msg` (`string`) | example: `Terima`

### Schema: `savePurchasePayment`

- **Type**: `object`
- **Required fields**: `account_id`, `amount`, `contact_id`, `payment_id`, `payment_no`, `payment_type`
- **Properties** (10):
  - `payment_id` (`number`) - Purchase Payment ID | example: `2`
  - `payment_no` (`string`) - Purchase Payment Number | example: `2`
  - `payment_type` (`number`) - Purchase Payment Type | example: `2`
  - `contact_id` (`number`) - Contact ID (Supplier) | example: `2`
  - `contact_name` (`string`) - Contact Name (Supplier) | example: `PTYANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `account_id` (`number`) - Account ID | example: `1`
  - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
  - `amount` (`number`) - Payment Amount | example: `100000`
  - `items` (`array of object`) - List Payment Detail
    - **Array item properties** (5):
      - `payment_detail_id` (`number`) - Payment Detail ID | example: `0`
      - `payment_id` (`number`) - Payment ID | example: `1`
      - `bill_id` (`number`) - Bill ID | example: `1`
      - `payment_amount` (`number`) - Payment Amount for Bill | example: `100000`
      - `downpayment_amount` (`number`) - Down Payment Amount for Bill | example: `50000`

### Schema: `getPurchasePaymentResponse`

- **Type**: `object`
- **Properties** (10):
  - `payment_id` (`number`) - Purchase Payment ID | example: `2`
  - `payment_no` (`string`) - Purchase Payment Number | example: `2`
  - `payment_type` (`number`) - Purchase Payment Type | example: `2`
  - `contact_id` (`number`) - Contact ID (Supplier) | example: `2`
  - `contact_name` (`string`) - Contact Name (Supplier) | example: `PTYANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `account_id` (`number`) - Account ID | example: `1`
  - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
  - `amount` (`number`) - Payment Amount | example: `100000`
  - `bills` (`array of object`) - List Payment Detail
    - **Array item properties** (6):
      - `payment_detail_id` (`number`) - Payment Detail ID | example: `0`
      - `bill_id` (`number`) - Bill ID | example: `1`
      - `grand_total` (`string`) - Bill Grand Total | example: `154000`
      - `payment_amount` (`string`) - Payment Amount for Bill | example: `100000`
      - `due` (`string`) - Not Paid Amount | example: `0`
      - `trx_date` (`string`) - Bill Transaction Date | example: `2018-10-02T04:00:00.000Z`

### Schema: `getPurchaseReturnsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (17):
      - `doc_id` (`number`) - Document ID | example: `2`
      - `doc_number` (`string`) - Document Number | example: `2`
      - `contact_id` (`number`) - Contact ID (Supplier) | example: `2`
      - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTYANYWAY`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
      - `purchaseorder_id` (`string`) - Purchase Order ID
      - `due_date` (`string`) - Due Date | example: `2018-10-02T04:00:00.000Z`
      - `is_opening_balance` (`boolean`) - Whether Transaction is an Opening Balance | example: `False`
      - `grand_total` (`string`) - Grand Total | example: `-77000`
      - `due` (`string`) - Payment Due | example: `-77000`
      - `doc_type` (`string`) - Document Type | example: `debit_note`
      - `age` (`number`) - Purchase Return Age | example: `0`
      - `age_due` (`number`) - Purchase Return Due Age | example: `0`
      - `is_consignment` (`boolean`) - If product is a consignment product or not | example: `False`
      - `note` (`string`)
      - `location_name` (`string`) | example: `Gudang Besar`
      - `total_qty` (`number`) | example: `100000`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `savePurchaseReturnRequest`

- **Type**: `object`
- **Required fields**: `location_id`, `return_no`, `supplier_name`
- **Properties** (12):
  - `return_id` (`number`) - Purchase Return ID | example: `0`
  - `return_no` (`string`) - Purchase Return Number | example: `[auto]`
  - `supplier_id` (`number`) - Contact ID (Supplier) | example: `1`
  - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Purchase Return Note | example: `Return`
  - `sub_total` (`number`) - Purchase Return Note | example: `77000`
  - `total_tax` (`number`) - Purchase Return Total Tax | example: `0`
  - `grand_total` (`number`) - Purchase Return Grand Total | example: `77000`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `items` (`array of object`) - List Purchase Return Detail
    - **Array item properties** (16):
      - `return_detail_id` (`number`) - Purchase Return Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `0`
      - `serial_no` (`string`) - Serial Number | example: `SN001`
      - `batch_no` (`string`) - Batch Number
      - `bill_detail_id` (`string`) - Bill Detail ID | example: `51569`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
      - `bin_id` (`number`) - Bin ID | example: `3`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `77000`
      - `cogs` (`number`) | example: `68093.936118`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be return | example: `1`
      - `tax_amount` (`number`) - Tax Amount | example: `0`
      - `amount` (`number`) - Total Amount | example: `77000`
      - `location_id` (`number`) - Location ID | example: `-1`

### Schema: `postPurchaseSerialNumberMarkPrintedRequest`

- **Type**: `object`
- **Required fields**: `bill_detail_id`
- **Properties** (1):
  - `bill_detail_id` (`number`) | example: `9898`

### Schema: `postPurchaseSerialNumberMarkPrintedResponse`

- **Type**: `object`
- **Properties** (1):
  - `status` (`string`) | example: `ok`

### Schema: `getPurchaseReturnResponse`

- **Type**: `object`
- **Properties** (14):
  - `return_id` (`number`) - Purchase Return ID | example: `0`
  - `return_no` (`string`) - Purchase Return Number | example: `[auto]`
  - `supplier_id` (`number`) - Contact ID (Supplier) | example: `1`
  - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-02T04:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Purchase Return Note | example: `Return`
  - `sub_total` (`string`) - Purchase Return Note | example: `77000`
  - `total_tax` (`string`) - Purchase Return Total Tax | example: `0`
  - `grand_total` (`string`) - Purchase Return Grand Total | example: `77000`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `location_name` (`number`) - Location Name | example: `Pusat`
  - `items` (`array of object`) - List Purchase Return Detail
    - **Array item properties** (19):
      - `return_detail_id` (`number`) - Purchase Return Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `0`
      - `item_code` (`string`) - Item Code | example: `BTY-L`
      - `item_name` (`number`) - Item Name | example: `Kaos DreamCatcher Born to Be Yours`
      - `serial_no` (`string`) - Serial Number | example: `SN001`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `invt_acct_id` (`number`) - Inventory Account ID | example: `4`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`string`) - Item Price | example: `77000`
      - `buy_price` (`string`) - Item Buy Price | example: `77000`
      - `original_price` (`string`) - Item Original Price | example: `77000`
      - `qty` (`string`) - Item Quantity | example: `1`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`string`) - Quantity that will be return | example: `1`
      - `tax_amount` (`string`) - Tax Amount | example: `0`
      - `amount` (`string`) - Total Amount | example: `77000`
      - `rate` (`string`) - Rate | example: `0`
      - `tax_name` (`string`) - Tax Name | example: `No Tax`
      - `account_name` (`string`) - Account Name | example: `1-1200 - Persediaan Barang`

### Schema: `getPurchaseReturnSettlementBillsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (10):
      - `doc_id` (`number`) - Document ID | example: `2`
      - `doc_number` (`string`) - Document Number | example: `2`
      - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTYANYWAY`
      - `return_no` (`string`) - Return Number | example: `PR-000000001`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
      - `trx_type` (`string`) - Transaction Type | example: `settlement`
      - `is_opening_balance` (`boolean`) - Whether Transaction is an Opening Balance | example: `False`
      - `amount` (`string`) - Transaction Amount | example: `-77000`
      - `return_id` (`number`) - Return ID | example: `1`
      - `doc_type` (`string`) - Document Type | example: `Potong Faktur`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveReturnSettlementBillRequest`

- **Type**: `object`
- **Required fields**: `contact_id`, `return_id`, `settlement_no`, `supplier_name`
- **Properties** (8):
  - `settlement_id` (`number`) - Purchase Return Settlement ID | example: `0`
  - `settlement_no` (`string`) - Purchase Return Settlement Number | example: `[auto]`
  - `return_id` (`number`) - Purchase Return ID | example: `2`
  - `contact_id` (`number`) - Contact ID (Supplier) | example: `3`
  - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `amount` (`number`) - Total Amount | example: `77000`
  - `items` (`array of object`)
    - **Array item properties** (3):
      - `settlement_detail_id` (`number`) - Purchase Return Settlement Detail ID | example: `1`
      - `bill_id` (`number`) - Bill ID | example: `1`
      - `payment_amount` (`number`) - Payment Amount | example: `77000`

### Schema: `getPurchaseReturnSettlementBillResponse`

- **Type**: `object`
- **Properties** (12):
  - `settlement_id` (`number`) - Purchase Return Settlement ID | example: `0`
  - `settlement_no` (`string`) - Purchase Return Settlement Number | example: `[auto]`
  - `return_id` (`number`) - Purchase Return ID | example: `2`
  - `return_no` (`string`) - Purchase Return Number | example: `PR-000000001`
  - `contact_id` (`number`) - Contact ID (Supplier) | example: `3`
  - `supplier_id` (`number`) - Contact ID (Supplier) | example: `3`
  - `supplier_name` (`string`) - Contact Name (Supplier) | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-02T04:00:00.000Z`
  - `amount` (`string`) - Amount | example: `25000`
  - `total` (`string`) - Total Amount | example: `25000`
  - `bills` (`array of object`) - List Bills Detail
    - **Array item properties** (8):
      - `settlement_detail_id` (`number`) - Purchase Return Settlement Detail ID | example: `1`
      - `payment_amount` (`string`) - Payment Amount | example: `25000`
      - `doc_id` (`number`) - Document ID | example: `14`
      - `doc_number` (`string`) - Document Number | example: `BIL-000000014`
      - `trx_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
      - `due_date` (`string`) - Due Date | example: `2018-10-02T04:00:00.000Z`
      - `grand_total` (`string`) - Grand Total | example: `25000`
      - `due` (`string`) - Due Amount | example: `0`

### Schema: `savePurchaseReturnSettlementRefundRequest`

- **Type**: `object`
- **Required fields**: `account_id`, `amount`, `contact_id`, `payment_id`, `payment_no`, `payment_type`
- **Properties** (10):
  - `payment_id` (`number`) - Purchase Return Setttlement Payment ID | example: `0`
  - `payment_no` (`string`) - Purchase Return Setttlement Payment Number | example: `[auto]`
  - `payment_type` (`number`) - Purchase Return Setttlement Payment Type | example: `2`
  - `contact_id` (`number`) - Contact ID (Supplier) | example: `4`
  - `contact_name` (`string`) - Contact Name (Supplier) | example: `PTANYWAY`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-02T04:00:00.000Z`
  - `account_id` (`number`) - Account ID | example: `1`
  - `note` (`string`) - Transaction Note | example: `Return`
  - `amount` (`number`) - Amount | example: `25000`
  - `items` (`array of object`) - List Detail Purchase Return Settlement Refund
    - **Array item properties** (3):
      - `payment_detail_id` (`number`) - Purchase Return Setttlement Payment Detail ID | example: `0`
      - `purch_return_id` (`number`) - Purchase Return ID | example: `1`
      - `payment_amount` (`number`) - Payment Amount | example: `25000`

### Schema: `getPurchaseSerialNumberWMSResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Serial Number & Batch Number of Items
    - **Array item properties** (11):
      - `serial_number_id` (`number`) | example: `121`
      - `bill_detail_id` (`number`) | example: `51575`
      - `serial_no` (`string`) | example: `HY732849`
      - `batch_no` (`number`) | example: `3824032`
      - `expired_date` (`string`)
      - `item_transfer_detail_id` (`number`)
      - `return_detail_id` (`number`)
      - `putaway_reference_id` (`number`)
      - `item_adj_detail_id` (`number`)
      - `bin_id` (`number`)
      - `item_id` (`number`) | example: `66257`
  - `is_putaway` (`boolean`) - If the products is already putaway | example: `False`

### Schema: `getReportsReceiveResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) | example: `ok`
  - `url` (`string`) | example: `https://report3.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Penerimaan Barang`

### Schema: `getReportsConsignResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) | example: `ok`
  - `url` (`string`) | example: `https://report3.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Konsinyasi`

### Schema: `getReportsInvoiceResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - status | example: `ok`
  - `url` (`string`) | example: `https://report2.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Faktur Penjualan`

### Schema: `getReportShippingLabel`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - Status | example: `OK`
  - `url` (`string`) - URL | example: `https://report.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXBv`
  - `title` (`string`) - Title | example: `Label Pengiriman`

### Schema: `getReportsPurchaseOrderDetailResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - Status | example: `ok`
  - `url` (`string`) - URL | example: `https://report3.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) - Title | example: `Laporan PO`

### Schema: `getReportsStockOpname`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - Status | example: `OK`
  - `url` (`string`) - URL | example: `https://report.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXBv`
  - `title` (`string`) - Title | example: `Laporan Opname`

### Schema: `getReportsWMSShippingManifestResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - Status | example: `ok`
  - `url` (`string`) - URL | example: `https://report3.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) - Title | example: `Laporan Bukti Pengiriman`

### Schema: `reportPutawayResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) | example: `ok`
  - `url` (`string`) | example: `https://report2.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Laporan Putaway`

### Schema: `getReportsItemReceivedNotPlaceResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) | example: `ok`
  - `url` (`string`) | example: `https://report2.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Daftar Barang Belum Ditempatkan`

### Schema: `getReportsAdjustmentStockResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) | example: `ok`
  - `url` (`string`) | example: `https://report2.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXB`
  - `title` (`string`) | example: `Penyesuaian`

### Schema: `getInvoicesResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (15):
      - `doc_id` (`number`) - Document ID | example: `2`
      - `doc_number` (`string`) - Document Number | example: `INV-000000222`
      - `contact_id` (`number`) - Contact ID (Customer) | example: `32`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Andy`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `due_date` (`string`) - Due Date | example: `2018-10-20T17:00:00.000Z`
      - `is_opening_balance` (`boolean`) - Whether Invoice is an Opening Balance | example: `False`
      - `grand_total` (`string`) - Invoice Grand Total | example: `4400000`
      - `due` (`string`) - Invoice Due Total | example: `4400000`
      - `doc_type` (`string`) - Document Type | example: `invoice`
      - `age` (`number`) - Invoice Age | example: `8`
      - `age_due` (`number`) - Invoice Age Due | example: `8`
      - `payment_id` (`number`) - Invoice Payment ID | example: `1`
      - `ref_no` (`string`) - Ref number
      - `so_customer_name` (`string`) - Customer Name
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveInvoiceRequest`

- **Type**: `object`
- **Required fields**: `customer_name`, `due_date`, `invoice_no`, `is_opening_balance`, `location_id`
- **Properties** (23):
  - `invoice_id` (`number`) - Invoice ID <br>
To create new invoice => "invoice_id": 0 <br>
To edit invoice => "invoice_id": {invoice_id}
 | example: `0`
  - `invoice_no` (`string`) - Invoice Number <br>
To create new invoice => "invoice_no": "[auto]" <br>
To edit invoice => "invoice_no": {invoice_no}
 | example: `[auto]`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `salesmen_id` (`number`) - Salesman ID
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Customer Name`
  - `transaction_date` (`string`) - Transaction Date | example: `2020-10-20T17:00:00.000Z`
  - `due_date` (`string`) - Due Date | example: `2020-10-20T17:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Invoice inlcude Tax | example: `False`
  - `note` (`string`) - Invoice Note | example: `Beli Tas Selempang`
  - `payment_acct_id` (`number`) - Payment Account ID | example: `1`
  - `payment` (`number`) - Invoice Payment | example: `40000`
  - `sub_total` (`number`) - Items Total Price | example: `30000`
  - `total_disc` (`number`) - Items Total Discount | example: `0`
  - `total_tax` (`number`) - Items Total Tax | example: `0`
  - `grand_total` (`number`) - Invoice Grand Total | example: `40000`
  - `ref_no` (`string`) - Reference Number | example: `99`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `is_opening_balance` (`boolean`) - Whether Invoice is an Opening Balance | example: `False`
  - `shipping_cost` (`number`) - Shipping Cost | example: `5000`
  - `insurance_cost` (`number`) - Inssurance Cost | example: `5000`
  - `add_disc` (`number`) - Additional Discount NB: You Need to Calculate the tax for every item if you are using tax like PPN | example: `0`
  - `add_fee` (`number`) - Additional Fee | example: `0`
  - `items` (`array of object`) - List Items in Invoice
    - **Array item properties** (15):
      - `invoice_detail_id` (`number`) - Invoice Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `5`
      - `serial_no` (`string`) - Item Serial Number | example: `SN001`
      - `description` (`string`) - Item Description | example: `Tas selempang Biru Dongker`
      - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `30000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity Item that will be reduced | example: `1`
      - `disc` (`number`) - Item Discount | example: `0`
      - `disc_amount` (`number`) - Item Total Amount | example: `0`
      - `tax_amount` (`number`) - Item Tax Amount NB: You Need to Calculate the tax for every item if you are using tax like PPN | example: `0`
      - `amount` (`number`) - Item Total Amount | example: `30000`
      - `cogs` (`number`) - Cost of Goods Sold | example: `11666.666667`
      - `location_id` (`number`) - Location ID | example: `-1`

### Schema: `getSalesInvoicesbyContactIDResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`) - List items that stock needs to adjust
    - **Array item properties** (10):
      - `invoice_id` (`number`) - Invoice ID | example: `2237391`
      - `invoice_no` (`string`) - Invoice Number | example: `INV-002237391`
      - `is_tax_included` (`boolean`) - If price is include tax | example: `False`
      - `add_fee` (`number`) | example: `0`
      - `add_disc` (`number`) | example: `0`
      - `service_fee` (`number`) - Service Fee | example: `0`
      - `location_id` (`number`) - Location ID | example: `1`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `sub_total` (`number`) | example: `100000000`
      - `total_disc` (`number`) | example: `0`

### Schema: `getInvoiceResponse`

- **Type**: `object`
- **Properties** (33):
  - `invoice_id` (`number`) - Invoice ID | example: `0`
  - `invoice_no` (`string`) - Invoice Number | example: `[auto]`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `0`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
  - `last_modified` (`string`) - Last Modified Date | example: `2018-10-20T17:00:00.000Z`
  - `due_date` (`string`) - Due Date | example: `2018-10-20T17:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Invoice inlcude Tax | example: `False`
  - `note` (`string`) - Invoice Note | example: `Beli Tas Selempang`
  - `payment_acct_id` (`number`) - Payment Account ID | example: `1`
  - `payment` (`number`) - Invoice Payment | example: `40000`
  - `payment_amount` (`number`) - Invoice Payment Amount | example: `40000`
  - `sub_total` (`string`) - Items Total Price | example: `30000`
  - `total_disc` (`string`) - Items Total Discount | example: `0`
  - `total_tax` (`string`) - Items Total Tax | example: `0`
  - `grand_total` (`string`) - Invoice Grand Total | example: `40000`
  - `ref_no` (`string`) - Reference Number | example: `99`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `location_name` (`number`) - Location Name | example: `Pusat`
  - `is_opening_balance` (`boolean`) - Whether Invoice is an Opening Balance | example: `False`
  - `shipping_cost` (`string`) - Shipping Cost | example: `5000`
  - `insurance_cost` (`string`) - Inssurance Cost | example: `5000`
  - `buyer_id` (`number`) - Buyer ID
  - `buyer_name` (`string`) - Buyer Name
  - `running_no` (`string`) - Running Number
  - `running_date` (`string`) - Running Date
  - `salesmen_id` (`number`) - Salesman ID
  - `salesmen_name` (`string`) - Salesman Name
  - `add_disc` (`string`) - .
  - `add_fee` (`string`) - Additional Fee
  - `service_fee` (`string`) - Service Fee
  - `items` (`array of object`) - List Items in Invoice
    - **Array item properties** (28):
      - `invoice_detail_id` (`number`) - Invoice Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `5`
      - `item_name` (`number`) - Item Name | example: `Tas selempang Biru Dongker`
      - `item_code` (`string`) - Item Code | example: `1203578196`
      - `serial_no` (`string`) - Item Serial Number | example: `SN001`
      - `description` (`string`) - Item Description | example: `Tas selempang Biru Dongker`
      - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`string`) - Item Price | example: `30000`
      - `sell_price` (`number`) - Sell Price | example: `30000`
      - `original_price` (`string`) - Original Price | example: `30000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty` (`number`) - item Quantity | example: `0`
      - `qty_in_base` (`string`) - Quantity Item that will be reduced | example: `1`
      - `disc` (`string`) - Item Discount | example: `0`
      - `disc_amount` (`string`) - Item Total Amount | example: `0`
      - `tax_amount` (`number`) - Item Tax Amount | example: `0`
      - `amount` (`number`) - Item Total Amount | example: `30000`
      - `cogs` (`number`) - Cost of Goods Sold | example: `11666.666667`
      - `location_id` (`number`) - Location ID | example: `-1`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `-1`
      - `rate` (`string`) - Rate | example: `0`
      - `tax_name` (`string`) - Tax Name | example: `No Tax`
      - `account_name` (`string`) - Account Name | example: `4-4000 - Penjualan`
      - `uom_id` (`number`) - Uom ID | example: `-1`
      - `batch_no` (`string`) - Batch number
      - `item_group_id` (`number`) - Item Group ID
      - `loc_id` (`number`) - Location ID

### Schema: `getInvoicesSummaryResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (4):
      - `store_id` (`string`) - Store Id | example: `383`
      - `store_name` (`string`) - Store Name | example: `Raicha.Store`
      - `channel_name` (`string`) - Channel Name | example: `SHOPEE`
      - `detail` (`array of object`) - List Items that exists in System
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveSalesOrderRequest`

- **Type**: `object`
- **Required fields**: `salesorder_id`, `salesorder_no`, `contact_id`, `customer_name`, `transaction_date`, `sub_total`, `total_disc`, `total_tax`, `grand_total`, `location_id`, `source`, `add_fee`, `add_disc`, `service_fee`, `items`
- **Properties** (41):
  - `salesorder_id` (`number`) - Sales Order ID <br>
To create new sales order => "salesorder_id": 0 <br>
To edit sales order => "salesorder_id": {salesorder_id}
 | example: `0`
  - `salesorder_no` (`string`) - Sales Order Number <br>
To create new sales order => "salesorder_no": "[auto]" <br>
To edit sales order => "salesorder_no": {salesorder_no}
 | example: `[auto]`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Radit`
  - `transaction_date` (`string`) - Transaction Date | example: `2020-10-20T17:00:00.000Z`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Purchase Order Note | example: `Tlg packingan yg aman ya kk`
  - `sub_total` (`number`) - Sub Total | example: `120000`
  - `total_disc` (`number`) - Total Discount | example: `0`
  - `total_tax` (`number`) - Total Tax | example: `0`
  - `grand_total` (`number`) - Grand Total | example: `120000`
  - `ref_no` (`string`) - Reference Number | example: `99`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `source` (`number`) - Purchase Source [1 = Internal] | example: `1`
  - `is_canceled` (`boolean`) - Whether Purchase is canceled | example: `False`
  - `cancel_reason` (`string`) - Cancel Reason | example: `Tidak Punya Uang`
  - `cancel_reason_detail` (`string`) - Cancel Reason Detail | example: `Tidak Punya Uang`
  - `channel_status` (`string`) - Channel Status | example: `Pending`
  - `shipping_cost` (`number`) - Shipping Cost | example: `5000`
  - `insurance_cost` (`number`) - Insurance Cost | example: `5000`
  - `is_paid` (`boolean`) - Whether Purchase is paid | example: `True`
  - `shipping_full_name` (`string`) - Shipping Full Name (Receiver Name) | example: `Radit`
  - `shipping_phone` (`string`) - Shipping Phone (Receiver) | example: `8227653121`
  - `shipping_address` (`string`) - Shipping Address | example: `Kutabumi`
  - `shipping_area` (`string`) - Shipping Area | example: `Sirnagalih`
  - `shipping_city` (`string`) - Shipping City | example: `Kab. Bogor`
  - `shipping_subdistrict` (`string`) - Shipping Subdistrict | example: `Tamansari`
  - `shipping_province` (`string`) - Shipping Province | example: `Jawa Barat`
  - `shipping_province_id` (`string`) - Shipping Province ID. To get the value, please read about 'Region' endpoints. Maximal 2 characters. | example: `11`
  - `shipping_district_id` (`string`) - Shipping District ID. To get the value, please read about 'Region' endpoints. | example: `1105`
  - `shipping_subdistrict_id` (`string`) - Shipping Subdistrict ID. To get the value, please read about 'Region' endpoints. | example: `1105`
  - `shipping_city_id` (`string`) - Shipping City ID. To get the value, please read about 'Region' endpoints. | example: `11`
  - `shipping_post_code` (`string`) - Shipping Post COde | example: `11750`
  - `shipping_country` (`string`) - Shipping Country | example: `Indonesia`
  - `add_disc` (`number`) - Additional Discount NB: You Need to Calculate the tax for every item if you are using tax like PPN | example: `0`
  - `add_fee` (`number`) - Additional Fee | example: `0`
  - `salesmen_id` (`number`) - Salesman ID
  - `store_id` (`string`) - Store ID
  - `service_fee` (`number`) - Service Fee
  - `payment_method` (`string`) - Payment method
  - `items` (`array of object`) - List Item in Purchase
    - **Array item properties** (16):
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `14`
      - `serial_no` (`string`) - Serial Number | example: `SN001`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `120000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be Purchased | example: `1`
      - `disc` (`number`) - Item Discount | example: `0`
      - `disc_amount` (`number`) - Item Discount Amount | example: `0`
      - `tax_amount` (`number`) - Item Tax Amount NB: You Need to Calculate the tax for every item if you are using tax like PPN | example: `0`
      - `amount` (`number`) - Item Total Amount | example: `120000`
      - `location_id` (`number`) - Item Location ID | example: `-1`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `channel_order_detail_id` (`number`) - Channel order detail ID
      - `tracking_no` (`string`) - Tracking Number/ Airway Bill | example: `CM94382503480`

### Schema: `saveID`

- **Type**: `object`
- **Properties** (1):
  - `id` (`number`) - Saved ID | example: `1`

### Schema: `getSalesOrderResponse`

- **Type**: `object`
- **Properties** (162):
  - `salesorder_id` (`number`) - Sales Order ID | example: `0`
  - `salesorder_no` (`string`) - Sales Order Number | example: `[auto]`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Radit`
  - `customer_phone` (`string`) - Contact Phone (Customer) | example: `8111111111`
  - `customer_email` (`string`) - Contact Email (Customer) | example: `test@jubelio.com`
  - `payment_date` (`string`) - Payment Date | example: `2018-10-20T17:00:00.000Z`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
  - `invoice_id` (`number`) - Invoice ID | example: `22`
  - `invoice_no` (`string`) - Invoice Number | example: `INV-000000222`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Sales Order note | example: `Tlg packingan yg aman ya kk`
  - `sub_total` (`number`) - Sub Total | example: `120000`
  - `total_disc` (`number`) - Total Discount | example: `0`
  - `total_tax` (`number`) - Total Tax | example: `0`
  - `grand_total` (`number`) - Grand Total | example: `120000`
  - `ref_no` (`string`) - Reference Number | example: `99`
  - `payment_method` (`string`) - Payment method | example: `cod`
  - `location_id` (`number`) - Header Location ID | example: `-1`
  - `source` (`number`) - Sales Order Source [1 = Internal] | example: `1`
  - `is_canceled` (`boolean`) - Whether SO is canceled | example: `False`
  - `cancel_reason` (`string`) - Cancel Reason | example: `Tidak Punya Uang`
  - `cancel_reason_detail` (`string`) - Cancel Reason Detail | example: `Tidak Punya Uang`
  - `channel_status` (`string`) - Channel Status from MP | example: `Pending`
  - `buyer_shipping_cost` (`number`) - Buyer Shipping Cost (For Cashless) | example: `10000`
  - `shipping_cost` (`number`) - Shipping Cost | example: `5000`
  - `insurance_cost` (`number`) - Insurance Cost | example: `5000`
  - `is_paid` (`boolean`) - Whether SO is paid | example: `True`
  - `shipping_full_name` (`string`) - Shipping Full Name (Receiver Name) | example: `Radit`
  - `shipping_phone` (`string`) - Shipping Phone (Receiver) | example: `87788124444`
  - `shipping_address` (`string`) - Shipping Address | example: `Kutabumi`
  - `shipping_area` (`string`) - Shipping Area | example: `Pasar Kemis`
  - `shipping_city` (`string`) - Shipping City | example: `Tangerang`
  - `shipping_province` (`string`) - Shipping Province | example: `Banten`
  - `shipping_post_code` (`string`) - Shipping Post Code | example: `11750`
  - `shipping_country` (`string`) - Shipping Country | example: `Indonesia`
  - `last_modified` (`string`) - Last Modified | example: `2020-04-08T13:30:05.319Z`
  - `register_session_id` (`number`) - Register Session ID | example: `1`
  - `user_name` (`string`) - User Name | example: `user`
  - `ordprdseq` (`string`) - .
  - `store_id` (`string`) - Store ID | example: `1`
  - `marked_as_complete` (`string`) - Mark as Complete
  - `is_tracked` (`string`) - Is Tracked
  - `store_so_number` (`string`) - Store SO Number
  - `is_deleted_from_picklist` (`boolean`) - Deleted from picklist | example: `False`
  - `deleted_from_picklist_by` (`string`) - Deleted from picklist by | example: `username`
  - `dropshipper` (`string`) - Dropshipper
  - `dropshipper_note` (`string`) - Dropshipper Note
  - `dropshipper_address` (`string`) - Dropshipper Address
  - `is_shipped` (`string`) - Is Shipped
  - `due_date` (`string`) - Due date
  - `received_date` (`string`) - Received date | example: `2020-04-08T13:30:05.319Z`
  - `salesmen_id` (`number`) - Salesmen ID | example: `1`
  - `salesmen_name` (`string`) - Salesmen Name | example: `salesname`
  - `escrow_amount` (`string`) - Escrow amount
  - `is_acknowledge` (`boolean`) - Is acknowledge | example: `True`
  - `acknowledge_status` (`string`) - Acknowledge status
  - `is_label_printed` (`boolean`) - Label printed | example: `True`
  - `is_invoice_printed` (`boolean`) - Invoice printed | example: `False`
  - `total_amount_mp` (`number`) - Total Amount Marketplace (COD)
  - `internal_do_number` (`string`) - Internal DO number
  - `internal_so_number` (`string`) - Internal SO number
  - `tracking_number` (`string`) - Tracking number
  - `courier` (`string`) - Courier | example: `J&T REG`
  - `username` (`string`) - Username | example: `user`
  - `is_po` (`boolean`) - Is PO | example: `False`
  - `picked_in` (`string`) - Picked In
  - `district_cd` (`string`) - District CD
  - `sort_code` (`string`) - Sort Code
  - `shipment_type` (`string`) - Shipment Type
  - `status_details` (`string`) - Status detail
  - `service_fee` (`string`) - Service fee | example: `0.0000`
  - `source_name` (`string`) - Channel name | example: `INTERNAL`
  - `store_name` (`string`) - Store name | example: `Store Name`
  - `location_name` (`string`) - Header Location Name | example: `Pusat`
  - `discount_marketplace` (`number`) - Discount Marketplace | example: `22000`
  - `shipper` (`string`) - Shipper | example: `J&T REG`
  - `tracking_no` (`string`) - Tracking Number / AWB | example: `2958792875272589000`
  - `add_disc` (`number`) - Additional Discount | example: `0`
  - `add_fee` (`number`) - Additional Fee | example: `0`
  - `total_weight_in_kg` (`string`) - The weight of order in KG | example: `0.30`
  - `is_cod` (`boolean`) - Whether COD or not | example: `False`
  - `dlvmthdcd` (`string`) - dlvmthdcd
  - `dlvetprscd` (`string`) - dlvetprscd
  - `dlvetprsnm` (`string`) - dlvetprsnm
  - `dlvno` (`string`) - dlvno
  - `closure_id` (`string`) - Closure ID
  - `tn_created_date` (`string`) - tn_created_date
  - `location_tax` (`string`) - Location Tax
  - `location_discount` (`string`) - Location Discount
  - `mp_timestamp` (`string`) - MP timestamp
  - `mp_cancel_reason` (`string`) - MP cancel reason
  - `mp_cancel_by` (`string`) - MP cancel by
  - `mp_cancel_date` (`string`) - MP cancel by
  - `label_printed_count` (`string`) - Label printed count
  - `package_count` (`string`) - Package count
  - `pickup_time_id` (`string`) - Pickup time ID
  - `pickup_time_value` (`string`) - Pickup time value
  - `is_escrow_updated` (`string`) - Whether escrow updated
  - `pos_outlet_discount` (`string`) - POS outlet discount
  - `pos_promotion_discount` (`string`) - POS promotion discount
  - `pos_cashier_input_discount` (`string`) - POS cashier input discount
  - `pos_payment_fee` (`string`) - POS payment fee
  - `pos_payment_charge` (`string`) - POS payment charge
  - `is_instant_courier` (`string`) - Whether instant courier | example: `False`
  - `dealpos_sales_note` (`string`) - Dealpos sales note
  - `dealpos_sales_type` (`string`) - Dealpos sales type
  - `shipping_provider_type` (`string`) - Shipping provider type
  - `is_fast_shiping_lz` (`string`) - Whether fast shipping lz
  - `pos_is_shipping` (`string`) - Whether pos is shipping | example: `False`
  - `shipping_subdistric` (`string`) - Shipping subdistric | example: `Setiabudi`
  - `shipping_province_id` (`number`) - Shipping province ID | example: `31`
  - `shipping_city_id` (`number`) - Shipping city ID | example: `3174`
  - `shipping_district_id` (`number`) - Shipping district ID | example: `317402`
  - `shipping_subdistrict_id` (`number`) - Shipping subdistrict ID | example: `3174021001`
  - `shipping_coordinate` (`string`) - Shipping coordinate
  - `awb_printed_count` (`number`) - AWB printed count | example: `0`
  - `sub_status` (`string`) - Sub status
  - `wms_status` (`string`) - WMS status | example: `PAID`
  - `zone_name` (`string`) - Zone name
  - `zone_id` (`string`) - Zone ID
  - `override_courier` (`string`) - Override courier
  - `failed_order_date` (`string`) - Failed order date
  - `warehouse_type` (`string`) - Warehouse type
  - `short_tracking_url` (`string`) - Short tracking URL
  - `voucher_amount` - Voucher amount
  - `original_shipment_cost` (`number`) - Original shipment cost | example: `0`
  - `is_tokopedia_plus` (`string`) - Whether tokopedia plus
  - `use_shipping_insurance` (`string`) - Use shipping insurance | example: `False`
  - `shipment_promotion_id` (`string`) - Shipment promotion ID
  - `shipping_cost_discount` (`number`) - Shipping cost discount | example: `0`
  - `priority_fulfillment_tag` (`string`) - Priority fulfillment tag
  - `fulfillment_sla` (`string`) - Fulfillment sla
  - `is_sameday` (`string`) - Whether sameday
  - `return_zone_id` (`string`) - Return zone ID
  - `internal_cancel_date` (`string`)
  - `is_rejected` (`boolean`) - Whether is rejected or not
  - `dbs_status` (`string`) - dbs status
  - `is_edit_value` (`string`) - Whether is edit or not | example: `True`
  - `shipping_fee_discount_platform` (`number`) - Shipping cost borne by the platform | example: `0`
  - `shipping_fee_discount_seller` (`number`) - Shipping cost borne by Seller | example: `0`
  - `extra_info` (`string`) - Extra info | example: `{}`
  - `tracking_url` (`string`) - Tracking URL
  - `cod_fee` (`number`) - COD Fee | example: `0`
  - `packages` (`string`) - Packages
  - `wms_statuses` (`string`) - WMS Statuses
  - `is_jubelio_shipment` (`boolean`) - Whether is jubelio shipment or not | example: `False`
  - `service_category_id` (`string`) - Service category ID
  - `biz_group` (`string`) - biz group
  - `buyer_id` (`number`) - Buyer ID | example: `1270398454`
  - `attachment` (`string`) - Attachment
  - `extra_info_header` (`string`) - extra info header | example: `{}`
  - `internal_status` (`sring`) - Internal status | example: `2.25`
  - `picklist_exist` (`string`) - Picklist exist | example: `False`
  - `picklist_completed` (`string`) - Picklist completed
  - `escrow_list` (`object`) - Escrow List | example: `{}`
  - `logo` (`array of object`)
    - **Array item properties** (4):
      - `url` (`string`) - url | example: `https://jb-assets-2.jb-assets-alpha-1.sg-sin1.`
      - `file_name` (`string`) - File name | example: `0ddc278399214eb25282`
      - `thumbnail` (`string`) - Thumbnail | example: `https://jb-assets-2.jb-assets-alpha-1.sg-sin1`
      - `sequence_number` (`number`) - Sequence number | example: `0`
  - `picker` (`string`) - Picker
  - `is_payment_gateway_invoice_paid` (`string`) - Whether payment gateway invoice paid or not
  - `payment_url` (`string`) - Payment URL
  - `items` (`array of object`) - List Item in Purchase
    - **Array item properties** (49):
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `14`
      - `serial_no` (`string`) - Serial Number | example: `SN001`
      - `disc_marketplace` (`number`) - Discount item marketplace | example: `22000`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `120000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be Order | example: `1`
      - `is_bundle` (`boolean`) - Whether item is bundle | example: `False`
      - `disc` (`number`) - Item Discount | example: `0`
      - `disc_amount` (`number`) - Item Discount Amount | example: `0`
      - `tax_amount` (`number`) - Item Tax Amount | example: `0`
      - `amount` (`number`) - Item Total Amount | example: `120000`
      - `location_id` (`number`) - Item Location ID | example: `-1`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `qty` (`number`) - Quantity | example: `1`
      - `uom_id` (`number`) | example: `-1`
      - `shipped_date` (`string`)
      - `channel_order_detail_id` (`number`)
      - `is_return_resolved` (`boolean`) - Return is resolved | example: `False`
      - `reject_return_reason` (`string`) - Reject return reason
      - `awb_created_date` (`string`) - Awn Created date
      - `ticket_no` (`string`)
      - `pack_scanned_date` (`string`)
      - `pick_scanned_date` (`string`)
      - `destination_code` (`string`)
      - `origin_code` (`string`)
      - `status` (`string`)
      - `item_code` (`string`) - Item code | example: `brg001`
      - `item_name` (`string`) - Item name | example: `Barang 1`
      - `sell_price` (`number`) - Sell price | example: `Barang 1`
      - `original_price` (`string`) - Original price | example: `10.000`
      - `rate` (`string`) | example: `0.00`
      - `tax_name` (`string`) - Tax name | example: `No Tax`
      - `item_group_id` (`number`) - . | example: `1`
      - `loc_id` (`number`) - .
      - `thumbnail` (`string`) - Thumbnail link | example: `https://truzteedev.blob.core.windows.net/images/rxayuyour32vvi5jygo4eq/cc05d0ef-`
      - `fbm` (`string`) - .
      - `is_canceled_item` (`string`) - Whether item is cancel item
      - `is_bundle_deal` (`string`) - Whether item is bundle deal | example: `False`
      - `use_serial_number` (`string`) - Use serial number | example: `False`
      - `use_batch_number` (`string`) - Use batch number | example: `False`
      - `loc_name` (`string`) - Location name | example: `Pusat`
      - `weight_in_gram` (`string`) - Weight of item in gram | example: `450`
      - `is_fbm` (`string`) - . | example: `False`
      - `variant` (`string`) - Variant of item
      - `serials` (`array`) - Serials | example: `[]`
      - `qty_picked` (`string`) - Qty picked

### Schema: `saveDeleteCanceledRequest`

- **Type**: `object`
- **Required fields**: `id`
- **Properties** (1):
  - `id` (`number`) - Sales Order ID | example: `1`

### Schema: `getSalesPicklistsbyPicklistIDResponse`

- **Type**: `object`
- **Properties** (8):
  - `items` (`array of object`)
    - **Array item properties** (29):
      - `picklist_detail_id` (`number`) - Picklist Detail ID | example: `4323379`
      - `item_id` (`number`) - Item ID | example: `53500`
      - `item_group_id` (`number`) - Item Group ID | example: `8213`
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty_ordered` (`number`) - Quantity needs to pick | example: `20`
      - `qty_picked` (`number`) - Quantity done picking | example: `0`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `5534040`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499913`
      - `source` (`number`) - Source | example: `1`
      - `store_id` (`string`) - Store ID
      - `channel_status` (`string`) - Channel Status | example: `Processing`
      - `bundle_item_id` (`number`) | example: `0`
      - `item_full_name` (`string`) - Item Full Name | example: `1025607544 - D'one Parfum Mobil Gantung / variasi mobil Aroma`
      - `serial_no` (`string`) - Serial Number
      - `batchs` (`string`)
      - `tracking_no` (`string`) - Tracking No.
      - `status` (`string`) - status
      - `bundle_full_name` (`string`) - status
      - `unit` (`string`) - Unit | example: `Buah`
      - `location_name` (`string`) - Location Name | example: `Gudang Besar`
      - `salesoder_no` (`string`) - Sales Order No | example: `SO-002499913`
      - `item_code` (`string`) - Item Code | example: `10283483`
      - `shipper` (`string`) - Shipper | example: `Grab Instant`
      - `picked_serials` (`array of object`)
      - `invoice_no` (`string`) - Invoice No.
      - `bin_id` (`number`) - Bin ID | example: `2`
      - `bin_final_code` (`string`) - Bin Final Code | example: `L1-R1-C1`
      - `end_qty` (`number`) - End Quantity | example: `100`
      - `thumbnail` (`string`) - thumbnail | example: `https://truzteedev.blob.core.windows.net/images/0swqgtzyqwoti4bwbawsvq/thumb_496`
  - `picklist_id` (`number`) - Picklist ID | example: `32458`
  - `picklist_no` (`number`) - Picklist No. | example: `PICK-000032458`
  - `created_date` (`string`) - Created Date | example: `2022-02-22T07:14:27.108Z`
  - `completed_date` (`string`) - Completed Date
  - `note` (`string`) - note
  - `is_completed` (`boolean`) | example: `False`
  - `picker_id` (`string`) - Picker ID | example: `ririn@staffgudang.com`

### Schema: `getSalesOrdersReturnedResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (19):
      - `contact_id` (`number`) - Contact ID | example: `6`
      - `invoice_id` (`number`) - Invoice ID | example: `1123`
      - `is_instant_courier` (`boolean`) - Is Instant Courier | example: `False`
      - `picklist_id` (`number`) - Picklist Id | example: `13324`
      - `picklist_no` (`string`) - Picklist Number | example: `PICK-000013324`
      - `salesorder_id` (`number`) - Sales Order ID | example: `6`
      - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000006`
      - `invoice_no` (`string`) - Invoice Number | example: `INV-000000222`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Pelanggan Umum`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
      - `channel_name` (`string`) - Channel Name | example: `Tokopedia`
      - `store_name` (`string`) - Source Name | example: `Toko Bahagia`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `tracking_no` (`string`) - Tracking Number | example: `JP2255122`
      - `store_id` (`string`) - Store ID | example: `1`
      - `source` (`string`) - Order Source in Id (MP/Channel) | example: `64`
      - `source_name` (`string`) - Source Name | example: `SHOPEE`
      - `store` (`string`) - Store Name
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveAirwayBillRequest`

- **Type**: `object`
- **Required fields**: `salesorder_id`, `tracking_no`, `shipper`
- **Properties** (3):
  - `salesorder_id` (`number`) - Sales Order ID | example: `1`
  - `tracking_no` (`string`) - Airway Bill | example: `1234567890`
  - `shipper` (`string`) - Shipper Name | example: `JNE REG`

### Schema: `saveReceivedDateRequest`

- **Type**: `object`
- **Properties** (2):
  - `salesorder_id` (`number`) - Sales Order ID | example: `1`
  - `received_date` (`string`) - Sales Order Received Date | example: `2018-10-20T17:00:00.000Z`

### Schema: `getPacklistsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (27):
      - `salesorder_id` (`number`) - Sales Order ID | example: `6`
      - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000006`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Pelanggan Umum`
      - `picklist_id` (`number`) - Picklist ID | example: `3`
      - `picklist_no` (`number`) - Picklist Number | example: `PICK-000000003`
      - `invoice_no` (`number`) - Invoice Number | example: `INV-000000003`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
      - `source` (`string`) - Source | example: `1`
      - `source_name` (`string`) - Source Name | example: `Internal`
      - `shipper` (`number`) - Shipper | example: `JNE`
      - `due_date` (`number`) - Payment Due Date | example: `0`
      - `store_id` (`string`) - Store ID | example: `1`
      - `store_name` (`string`) - Store Name | example: `Internal`
      - `s_address` (`string`) - Receiver Address | example: `Kutabumi`
      - `address` (`string`) - Receiver Address | example: `Kutabumi`
      - `s_area` (`string`) - Receiver Address Area | example: `Pasar Kemis`
      - `s_city` (`string`) - Receiver Address City | example: `Tangerang`
      - `s_province` (`string`) - Receiver Address Province | example: `Banten`
      - `s_post_code` (`string`) - Receiver Address Post Code | example: `11750`
      - `ship_address` (`string`) - Shipping Full Address | example: `Kutabumi/r/nPasar Kemis/r/nTangerang/r/nBanten/r/n11750`
      - `marketplace_status` (`string`) - Market Place Status | example: `paid`
      - `tracking_no` (`string`) - Tracking Number | example: `TRC-00000001`
      - `ref_no` (`string`) - Tracking Number
      - `store` (`string`) - Store name
      - `shipment_type` (`string`) - Shipment type
      - `status_details` (`string`) - Status details
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getSalesShipmentsShipmentHeaderIdResponse`

- **Type**: `object`
- **Properties** (16):
  - `items` (`array of object`)
    - **Array item properties** (20):
      - `shipment_detail_id` (`number`) - Shipment Detail ID | example: `594721`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499915`
      - `tracking_no` (`string`) - Tracking No.
      - `reason` (`string`) - Reason
      - `marketplace_status` (`string`) - Marketplace Status | example: `Shipped`
      - `ticket_no` (`string`) - Ticket No.
      - `destination_code` (`string`) - Destination Code
      - `origin_code` (`string`) - Origin Code
      - `misc` (`string`) - Misc
      - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499915`
      - `source` (`number`) - Source | example: `1`
      - `source_name` (`string`) - Source Name | example: `INTERNAL`
      - `customer_name` (`string`) - Customer Name | example: `Ina Namora Putri Siregar`
      - `address` (`string`) - Address | example: `Jl. Wahyu Raya No. 112`
      - `is_tracked` (`boolean`)
      - `store_id` (`string`) - Store ID
      - `ref_no` (`string`) - Reference No.
      - `total_weight_in_kg` (`number`) | example: `0.5`
      - `total_qty` (`number`) | example: `20`
      - `is_picked` (`boolean`) | example: `True`
  - `shipment_header_id` (`number`) - Shipment Header ID | example: `10495`
  - `shipment_no` (`string`) - Shipment Number | example: `SHP-000010495`
  - `courier_id` (`number`) - Courier ID | example: `1`
  - `transaction_date` (`string`) - Transaction Date | example: `2022-03-09T02:16:53.523Z`
  - `location_id` (`number`) - Location ID | example: `1`
  - `note` (`string`) - Note
  - `shipment_type` (`string`) - Shipment Type | example: `2`
  - `shipment_date` (`string`) - Shipment Date | example: `2022-03-12T02:16:44.879Z`
  - `is_completed` (`boolean`)
  - `employee_id` (`string`) | example: `ririn@gudangstaff.com`
  - `courier_new_id` (`number`) - Courier New ID | example: `1`
  - `completed_date` (`string`) - Completed Date
  - `courier_name` (`string`) - Courier Name | example: `JNE`
  - `employee_name` (`string`) - Employee Name | example: `RIRIN`
  - `location_name` (`string`) - Location Name | example: `Gudang Besar`

### Schema: `getPacklistResponse`

- **Type**: `object`
- **Properties** (82):
  - `salesorder_id` (`number`) - Sales Order ID | example: `6`
  - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000006`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Pelanggan Umum`
  - `picklist_id` (`number`) - Picklist ID | example: `3`
  - `picklist_no` (`number`) - Picklist Number | example: `PICK-000000003`
  - `invoice_no` (`number`) - Invoice Number | example: `INV-000000003`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
  - `source` (`string`) - Source | example: `1`
  - `source_name` (`string`) - Source Name | example: `Internal`
  - `shipper` (`number`) - Shipper | example: `JNE`
  - `due_date` (`number`) - Payment Due Date | example: `0`
  - `store_id` (`string`) - Store ID | example: `1`
  - `store_name` (`string`) - Store Name | example: `Internal`
  - `shipping_full_name` (`string`) - Shipping Full Name (Receiver) | example: `Mikha`
  - `shipping_address` (`string`) - Shipping Address | example: `Kutabumi`
  - `shipping_area` (`string`) - Shipping Address Area | example: `Pasar Kemis`
  - `shipping_city` (`string`) - Shipping Address City | example: `Tangerang`
  - `shipping_province` (`string`) - Shipping Address Province | example: `Banten`
  - `shipping_post_code` (`string`) - Shipping Address Post Code | example: `11750`
  - `shipping_country` (`string`) - Shipping Address Country | example: `Indonesia`
  - `ship_address` (`string`) - Shipping Full Address | example: `KutabumiPasar Kemis/r/nTangerang/r/nBanten/r/n11750`
  - `tracking_no` (`string`) - Tracking Number | example: `TRC-00000001`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Note | example: `Kaos Dreamcatcher`
  - `sub_total` (`string`) - Sub Total | example: `120000`
  - `total_disc` (`string`) - Total Discount | example: `0`
  - `total_tax` (`string`) - Total Tax | example: `0`
  - `grand_total` (`string`) - Grand Total | example: `120000`
  - `ref_no` (`string`) - Reference Number | example: `99`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `is_canceled` (`boolean`) - Whether Order is Canceled | example: `False`
  - `cancel_reason` (`string`) - Cancel Reason
  - `is_paid` (`boolean`) - Whether Order have been Paid | example: `True`
  - `channel_status` (`string`) - Channel Status | example: `paid`
  - `shipping_cost` (`string`) - Shipping Cost | example: `5000`
  - `insurance_cost` (`string`) - Insurance Cost | example: `5000`
  - `contact_id` (`number`) - Contact ID
  - `payment_method` (`string`) - Payment Method
  - `cancel_reason_detail` (`string`) - Cancel reason
  - `last_modified` (`string`) - Last modified date | example: `2020-03-29T05:05:27.326Z`
  - `register_session_id` (`number`) - Register session ID
  - `user_name` (`string`) - Username
  - `dlvmthdcd` (`string`) - .
  - `dlvetprscd` (`string`) - .
  - `dlvetprsnm` (`string`) - .
  - `dlvno` (`string`) - .
  - `ordprdseq` (`string`) - .
  - `marked_as_complete` (`boolean`) - .
  - `is_tracked` (`boolean`) - .
  - `store_so_number` (`string`) - .
  - `is_deleted_from_picklist` (`boolean`) - Is Deleted | example: `False`
  - `dropshipper` (`string`) - Dropshipper
  - `dropshipper_address` (`string`) - Dropshipper Address
  - `is_shipped` (`boolean`) - Is shipped
  - `received_date` (`string`) - Is shipped
  - `salesmen_id` (`number`) - Salesman ID
  - `shipping_phone` (`string`) - Is shipped | example: `83899988999`
  - `escrow_amount` (`string`) - The escrow value is the value to be paid to the seller from the MP after deducting the admin fee. | example: `315000`
  - `is_acknowledge` (`boolean`) - .
  - `acknowledge_status` (`string`) - Acknowledge status
  - `deleted_from_picklist_by` (`string`) - Deleted by
  - `add_disc` (`string`) - . | example: `0.0000`
  - `add_fee` (`string`) - . | example: `0.0000`
  - `is_label_printed` (`boolean`) - Label printed | example: `False`
  - `is_invoice_printed` (`boolean`) - Invoice printed | example: `False`
  - `total_amount_mp` (`number`) - Total amount mp
  - `internal_do_number` (`string`) - Internal DO Number
  - `internal_so_number` (`string`) - Internal SO Number
  - `tracking_number` (`string`) - Tracking Number
  - `courier` (`string`) - Courier
  - `closure_id` (`number`) - Closure ID
  - `username` (`string`) - Username
  - `is_po` (`boolean`) - Is PreOrder | example: `False`
  - `tn_created_date` (`string`) - .
  - `picked_in` (`string`) - .
  - `district_cd` (`string`) - .
  - `sort_code` (`string`) - .
  - `shipment_type` (`string`) - Type of Shipment
  - `status_details` (`string`) - Status details
  - `service_fee` (`string`) - Service fee
  - `items` (`array of object`) - Insurance Cost
    - **Array item properties** (6):
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `7`
      - `channel_order_detail_id` (`number`) - Channel Order Detail ID | example: `0`
      - `item_code` (`string`) - Item Code | example: `BTY-L`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `qty_in_base` (`string`) - Quantity that will be purchased | example: `1`
      - `unit` (`string`) - Unit Name | example: `Buah`

### Schema: `createInvoiceRequest`

- **Type**: `object`
- **Required fields**: `salesorder_id`
- **Properties** (1):
  - `salesorder_id` (`number`) - Sales Order ID | example: `1`

### Schema: `createInvoiceResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Delete Status | example: `ok`
  - `id` (`number`) - Sales Invoice Number | example: `8`

### Schema: `getShippedOrdersResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (22):
      - `salesorder_id` (`number`) - Sales Order ID | example: `6`
      - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000006`
      - `invoice_no` (`string`) - Invoice Number | example: `INV-000000222`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Pelanggan Umum`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
      - `source_name` (`string`) - Source Name | example: `Shopee`
      - `source` (`number`) - Source | example: `1`
      - `picklist_id` (`number`) - Picklist ID | example: `1`
      - `picklist_no` (`string`) - Picklist Number | example: `PICK-000000003`
      - `store_name` (`string`) - Store Name | example: `Shopee`
      - `store_id` (`string`) - Store ID | example: `2`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `tracking_no` (`string`) - Tracking Number | example: `1212121212`
      - `ship_address` (`string`) - Shipping Full Address | example: `Kutabumi/r/nPasar Kemis/r/nTangerang/r/nBanten/r/n11750`
      - `is_shipped` (`boolean`) - Whether Order have been Shipped | example: `True`
      - `b_tracking_no` (`string`) - Tracking Number | example: `true|1212121212`
      - `status` (`string`) - Status | example: `Paid`
      - `awb_created_date` (`string`) - AWB Created Date | example: `2020-03-27T12:18:20.841Z`
      - `invoice_id` (`number`) - Invoice ID | example: `1`
      - `shipment_type` (`string`) - Type of Shipment
      - `status_details` (`string`) - Status details
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getSalesPaymentsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (9):
      - `payment_id` (`number`) - Payment ID | example: `4`
      - `payment_no` (`string`) - Payment Number | example: `CP-0000004`
      - `contact_id` (`number`) - Contact ID | example: `1`
      - `contact_name` (`string`) - Contact Name | example: `Mikha Januardi Millen - 08987456123 - mikha.januardi@gmail.com`
      - `account_id` (`number`) - Account ID | example: `1`
      - `account_name` (`string`) - Account Name | example: `Kas`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `amount` (`number`) - Payment Amount | example: `130000`
      - `settlement_no` (`string`) - Settlement Number
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveSalesPaymentRequest`

- **Type**: `object`
- **Required fields**: `account_id`, `amount`, `contact_id`, `payment_id`, `payment_no`, `payment_type`
- **Properties** (11):
  - `payment_id` (`number`) - Payment ID | example: `0`
  - `payment_no` (`string`) - Payment Number | example: `[auto]`
  - `payment_type` (`number`) - Payment Type | example: `0`
  - `contact_id` (`number`) - Payment ID | example: `0`
  - `contact_name` (`string`) - Contact ID | example: `1`
  - `transaction_date` (`string`) - Tranasction Date | example: `2019-01-13T21:07:13.273Z`
  - `account_id` (`number`) - Account ID | example: `1`
  - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
  - `note` (`string`) - Payment Note | example: `Bayar Faktur INV-00001`
  - `amount` (`number`) - Payment Amount | example: `100000`
  - `items` (`array of object`) - List Payment Detail
    - **Array item properties** (3):
      - `payment_detail_id` (`number`) - Payment Detail ID | example: `1`
      - `invoice_id` (`number`) - Invoice ID | example: `10`
      - `payment_amount` (`number`) - Invoice Amount | example: `100000`

### Schema: `getSalesPaymentResponse`

- **Type**: `object`
- **Properties** (11):
  - `payment_id` (`number`) - Payment ID | example: `0`
  - `payment_no` (`string`) - Payment Number | example: `[auto]`
  - `payment_type` (`number`) - Payment Type | example: `0`
  - `contact_id` (`number`) - Payment ID | example: `0`
  - `contact_name` (`string`) - Contact ID | example: `1`
  - `transaction_date` (`string`) - Tranasction Date | example: `2019-01-13T21:07:13.273Z`
  - `account_id` (`number`) - Account ID | example: `1`
  - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
  - `note` (`string`) - Payment Note | example: `Bayar Faktur INV-00001`
  - `amount` (`string`) - Payment Amount | example: `100000`
  - `invoices` (`array of object`) - List Payment Invoices
    - **Array item properties** (8):
      - `payment_detail_id` (`number`) - Payment Detail ID | example: `1`
      - `payment_id` (`number`) - Payment ID | example: `1`
      - `trx_date` (`string`) - Tranasction Date | example: `2019-01-13T21:07:13.273Z`
      - `invoice_id` (`number`) - Invoice ID | example: `10`
      - `payment_amount` (`number`) - Invoice Amount | example: `100000`
      - `due` (`number`) - Invoice Due Amount | example: `0`
      - `grand_total` (`number`) - Invoice Grand Total Amount | example: `126000`
      - `doc_number` (`number`) - Document Number | example: `INV-000000013`

### Schema: `getItemsToPickResponse`

- **Type**: `array`
- **Item properties** (11):
  - `salesorder_id` (`number`) - Sales Order ID | example: `12`
  - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `82`
  - `item_id` (`number`) - Item ID | example: `2`
  - `item_full_name` (`string`) - Item Full Name | example: `BAR-1-PIN - Barang 1`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `location_name` (`number`) - Location Name | example: `Pusat`
  - `qty_ordered` (`string`) - Ordered Quantity | example: `1`
  - `unit` (`string`) - Unit Name | example: `Buah`
  - `salesorder_no` (`string`) - Sales Order Number | example: `SO-000000062`
  - `bundle_item_id` (`number`) - Bundle Item ID | example: `0`
  - `end_qty` (`string`) - End Quantity | example: `6`

### Schema: `requestAwbOrderResponse`

- **Type**: `object`
- **Properties** (6):
  - `salesorder_id` (`number`) - Sales order ID | example: `1`
  - `shipper` (`string`) - Shipper | example: `JNE Cashless`
  - `reason` (`string`) - Reason
  - `tracking_no` (`string`) - Tracking number | example: `BLIJC02118495321`
  - `channel_order_detail_id` (`string`) - The detail Id of channel Order | example: `12099677836`
  - `package_id` (`string`) - The package Id | example: `2118495321`

### Schema: `requestAwbOrderError`

- **Type**: `object`
- **Properties** (3):
  - `statusCode` (`string`) - Error Status Code | example: `400`
  - `error` (`string`) - Bad Request | example: `Internal Server Error`
  - `message` (`string`) - Error Message | example: `Error when getting AWB`

### Schema: `getSalesReturnInvoicesResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (9):
      - `doc_id` (`number`) - Document ID | example: `4`
      - `doc_no` (`string`) - Document Number | example: `SR-000000001`
      - `customer_name` (`string`) - Contact Name | example: `Mikha Januardi Millen`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `return_id` (`string`) - Return ID | example: `1`
      - `return_no` (`string`) - Return Number | example: `SR-000000001`
      - `trx_type` (`string`) - Transaction Type | example: `settlement`
      - `amount` (`string`) - Amount | example: `120000`
      - `doc_type` (`string`) - Document Type | example: `Potong Faktur`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveSalesReturnInvoiceRequest`

- **Type**: `object`
- **Required fields**: `contact_id`, `customer_name`, `return_id`, `settlement_no`
- **Properties** (8):
  - `settlement_id` (`number`) - Sales Return Settlement ID | example: `0`
  - `settlement_no` (`string`) - Sales Return Settlement Number | example: `[auto]`
  - `return_id` (`number`) - Sales Return ID | example: `1`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Mikha`
  - `transaction_date` (`string`) - Transaction Date | example: `2019-01-13T22:03:56.972Z`
  - `amount` (`number`) - Settlement Amount | example: `120000`
  - `items` (`array of object`)
    - **Array item properties** (3):
      - `settlement_detail_id` (`number`) - Sales Return Settlement Detail ID | example: `0`
      - `invoice_id` (`number`) - Invoice ID | example: `1`
      - `payment_amount` (`number`) - Invoice Payment Amount | example: `120000`

### Schema: `getSalesReturnInvoiceResponse`

- **Type**: `object`
- **Properties** (12):
  - `settlement_id` (`number`) - Sales Return Settlement ID | example: `0`
  - `settlement_no` (`string`) - Sales Return Settlement Number | example: `[auto]`
  - `return_id` (`number`) - Sales Return ID | example: `1`
  - `return_no` (`number`) - Sales Return Number | example: `SR-000000001`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Mikha`
  - `transaction_date` (`string`) - Transaction Date | example: `2019-01-13T22:03:56.972Z`
  - `created_date` (`string`) - Transaction Date | example: `2019-01-13T22:03:56.972Z`
  - `amount` (`string`) - Settlement Amount | example: `120000`
  - `total` (`string`) - Settlement Amount Total | example: `120000`
  - `items` (`array of object`)
    - **Array item properties** (8):
      - `settlement_detail_id` (`number`) - Sales Return Settlement Detail ID | example: `0`
      - `payment_amount` (`number`) - Invoice Payment Amount | example: `120000`
      - `doc_id` (`number`) - Document ID | example: `9`
      - `doc_number` (`string`) - Document Number | example: `INV-000000012`
      - `trx_date` (`string`) - Transaction Date | example: `2019-01-13T22:03:56.972Z`
      - `due_date` (`string`) - Due Date | example: `2019-01-13T22:03:56.972Z`
      - `grand_total` (`string`) - Invoice Grand Total | example: `130000`
      - `due` (`string`) - Invoice Due Amount | example: `10000`

### Schema: `saveSalesReturnRefundRequest`

- **Type**: `object`
- **Required fields**: `account_id`, `amount`, `contact_id`, `payment_id`, `payment_no`, `payment_type`
- **Properties** (9):
  - `payment_id` (`number`) - Sales Return Payment ID | example: `0`
  - `payment_no` (`string`) - Sales Return Payment Number | example: `[auto]`
  - `payment_type` (`number`) - Payment Type | example: `3`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `contact_name` (`string`) - Contact Name (Customer) | example: `Mikha`
  - `transaction_date` (`string`) - Transaction Date | example: `2019-01-13T21:52:45.041Z`
  - `account_id` (`number`) - Account ID | example: `1`
  - `amount` (`number`) - Payment Amount | example: `120000`
  - `items` (`array of object`) - List Sales Return Payment Detail
    - **Array item properties** (3):
      - `payment_detail_id` (`number`) - Sales Return Payment Detail ID | example: `0`
      - `sales_return_id` (`number`) - Sales Return ID | example: `1`
      - `payment_amount` (`number`) - Payment Amount | example: `120000`

### Schema: `getReturnsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (15):
      - `salesorder_id` (`number`) - Sales Order ID | example: `39737`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `2991`
      - `item_id` (`number`) - Item ID | example: `4671`
      - `qty_in_base` (`number`) - Item Quantity | example: `1`
      - `item_code` (`string`) - Item Code | example: `SK-67565478`
      - `item_name` (`string`) - Item Name | example: `VASELINE LOTION HIBA LIMITED EDITION JEPANG 200ML`
      - `reject_return_reason` (`string`) - Reject Return Reason | example: `Ada sobekan`
      - `is_return_resolved` (`boolean`) - Whether Return Resolved | example: `False`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Andy`
      - `salesorder_no` (`string`) - Sales order Number | example: `ZL-2418274`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `source_name` (`string`) - Zalora | example: `False`
      - `store` (`string`) - Store | example: `info@dodle.co.id`
      - `store_name` (`string`) - Store Name | example: `Zalora - info@dodle.co.id`
      - `payment_method` (`string`) - Payment method
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getSalesReturnsItemsUnprocessedWMSResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List of Sales Return Items
    - **Array item properties** (18):
      - `salesorder_id` (`number`) - Sales Order ID | example: `2434615`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `5390844`
      - `qty_in_base` (`string`) - Quantity Item that will be reduced | example: `1`
      - `item_code` (`string`) - Item Code | example: `1203578196`
      - `item_name` (`number`) - Item Name | example: `Tas selempang Biru Dongker`
      - `reject_return_reason` (`string`) - Reject Return Reason
      - `is_return_resolved` (`boolean`)
      - `customer_name` (`string`) - Customer Name | example: `Nabila Naimi`
      - `salesorder_no` (`string`) - Salesorder Number | example: `SP-734845GGE`
      - `transaction_date` (`string`) | example: `2021-09-19T11:55:58.000Z`
      - `payment_method` (`string`) - Payment Method | example: `COD`
      - `source_name` (`string`) | example: `SHOPEE`
      - `created_date` (`string`) | example: `2021-09-09T16:34:45.509Z`
      - `store` (`string`) - Store | example: `Indo Ultimate`
      - `courier` (`string`) - Courier Name | example: `siCepat`
      - `location_id` (`string`) - Location ID | example: `-1`
      - `location_name` (`string`) - Gudang Retail | example: `Gudang Retail`
      - `store_name` (`string`) - Store Name | example: `Shopee Indo Ultimate`
  - `totalCount` (`number`) - Total Count of All Data | example: `20`

### Schema: `getRejectedReturnsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (15):
      - `salesorder_id` (`number`) - Sales Order ID | example: `39737`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `2991`
      - `item_id` (`number`) - Item ID | example: `4671`
      - `qty_in_base` (`number`) - Item Quantity | example: `1`
      - `item_code` (`string`) - Item Code | example: `SK-67565478`
      - `item_name` (`string`) - Item Name | example: `VASELINE LOTION HIBA LIMITED EDITION JEPANG 200ML`
      - `reject_return_reason` (`string`) - Reject Return Reason | example: `Ada sobekan`
      - `is_return_resolved` (`boolean`) - Whether Return Resolved | example: `False`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Andy`
      - `salesorder_no` (`string`) - Sales order Number | example: `ZL-2418274`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `source_name` (`string`) - Zalora | example: `False`
      - `store` (`string`) - Store | example: `info@dodle.co.id`
      - `store_name` (`string`) - Store Name | example: `Zalora - info@dodle.co.id`
      - `payment_method` (`string`) - Payment method
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getApprovedReturnsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (15):
      - `salesorder_id` (`number`) - Sales Order ID | example: `39737`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `2991`
      - `item_id` (`number`) - Item ID | example: `4671`
      - `qty_in_base` (`number`) - Item Quantity | example: `1`
      - `item_code` (`string`) - Item Code | example: `SK-67565478`
      - `item_name` (`string`) - Item Name | example: `VASELINE LOTION HIBA LIMITED EDITION JEPANG 200ML`
      - `reject_return_reason` (`string`) - Reject Return Reason | example: `Ada sobekan`
      - `is_return_resolved` (`boolean`) - Whether Return Resolved | example: `True`
      - `customer_name` (`string`) - Contact Name (Customer) | example: `Andy`
      - `salesorder_no` (`string`) - Sales order Number | example: `ZL-2418274`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `source_name` (`string`) - Zalora | example: `False`
      - `store` (`string`) - Store | example: `info@dodle.co.id`
      - `store_name` (`string`) - Store Name | example: `Zalora - info@dodle.co.id`
      - `payment_method` (`string`) - Payment method
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getSalesReturnsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (12):
      - `doc_id` (`number`) - Document ID | example: `4`
      - `doc_number` (`string`) - Document Number | example: `SR-000000001`
      - `contact_id` (`number`) - Contact ID | example: `1`
      - `customer_name` (`string`) - Contact Name | example: `Mikha Januardi Millen`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `due_date` (`string`) - Due Date | example: `2018-10-20T17:00:00.000Z`
      - `is_opening_balance` (`boolean`) - Whether Transaction is an Opening Balance | example: `False`
      - `grand_total` (`string`) - Payment Amount | example: `-120000`
      - `due` (`string`) - Due | example: `-120000`
      - `doc_type` (`string`) - Document Type | example: `credit_note`
      - `age` (`number`) - Age | example: `0`
      - `age_due` (`number`) - Age Due | example: `0`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `saveSalesReturnRequest`

- **Type**: `object`
- **Required fields**: `customer_name`, `location_id`, `return_no`
- **Properties** (18):
  - `return_id` (`number`) - Sales Return ID | example: `0`
  - `return_no` (`string`) - Sales Return Number | example: `[auto]`
  - `customer_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `1`
  - `transaction_date` (`string`) - Tranasction Date | example: `2019-01-13T21:21:32.261Z`
  - `is_tax_included` (`boolean`) - Whether Tax is Included | example: `False`
  - `note` (`string`) - Sales Return Note | example: `Barang Cacat`
  - `sub_total` (`number`) - Sub Total | example: `120000`
  - `total_disc` (`number`) - Total Discount | example: `0`
  - `total_tax` (`number`) - Total Tax | example: `0`
  - `grand_total` (`number`) - Grand Total | example: `120000`
  - `invoice_id` (`number`) - Invoice ID | example: `9`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `add_fee` (`number`) | example: `0`
  - `add_disc` (`number`) | example: `0`
  - `service_fee` (`number`) | example: `0`
  - `auto_placement` (`boolean`) - if you want to place the items directly to the default rack/shelve. | example: `False`
  - `items` (`array of object`)
    - **Array item properties** (19):
      - `return_detail_id` (`number`) - Return Detail ID | example: `0`
      - `invoice_detail_id` (`number`) - Invoice Detail ID | example: `0`
      - `serial_no` (`string`) - Serial Number
      - `batch_no` (`string`) - Batch Number
      - `expired_date` (`string`)
      - `item_id` (`number`) - Item ID | example: `5`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `120000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be return | example: `1`
      - `original_return_detail_id` (`number`) | example: `0`
      - `tax_amount` (`number`) - Tax Amount | example: `0`
      - `amount` (`number`) - Total Amount | example: `120000`
      - `cogs` (`number`) - Cost of Goods Sold | example: `78000`
      - `location_id` (`number`) - Location ID | example: `-1`
      - `disc` (`number`) - Discount | example: `0`
      - `disc_amount` (`number`) - Total Discount Amount | example: `0`

### Schema: `getSalesReturnResponse`

- **Type**: `object`
- **Required fields**: `customer_name`, `location_id`, `return_no`
- **Properties** (16):
  - `return_id` (`number`) - Sales Return ID | example: `0`
  - `return_no` (`string`) - Sales Return Number | example: `[auto]`
  - `customer_id` (`number`) - Customer ID | example: `1`
  - `customer_name` (`string`) - Customer Name | example: `1`
  - `transaction_date` (`string`) - Tranasction Date | example: `2019-01-13T21:21:32.261Z`
  - `created_date` (`string`) - Created Date | example: `2019-01-13T21:21:32.261Z`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Sales Return Note | example: `Barang Cacat`
  - `sub_total` (`string`) - Sub Total | example: `120000`
  - `total_tax` (`string`) - Total Tax | example: `0`
  - `grand_total` (`string`) - Grand Total | example: `120000`
  - `invoice_id` (`number`) - Invoice ID | example: `9`
  - `location_id` (`number`) - Location ID | example: `-1`
  - `invoice_no` (`number`) - Invoice Number | example: `INV-000000012`
  - `location_name` (`number`) - Location Name | example: `Pusat`
  - `items` (`array of object`) - List Return Detail
    - **Array item properties** (21):
      - `return_detail_id` (`number`) - Return Detail ID | example: `0`
      - `invoice_detail_id` (`number`) - Invoice Detail ID | example: `0`
      - `serial_no` (`string`) - Serial Number
      - `item_id` (`number`) - Item ID | example: `5`
      - `item_name` (`number`) - Item Name | example: `Kaos DreamCatcher Born to Be Yours`
      - `item_code` (`string`) - Item Code | example: `BTY-L`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `sales_acct_id` (`number`) - Sales Account ID | example: `28`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `tax_name` (`string`) - Tax Name | example: `No Tax`
      - `account_name` (`string`) - Account Name | example: `4-4000 - Penjualan`
      - `price` (`string`) - Item Price | example: `120000`
      - `sell_price` (`number`) - Item Sell Price | example: `120000`
      - `original_price` (`string`) - Item Original Price | example: `120000`
      - `rate` (`string`) - Rate | example: `0`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be return | example: `1`
      - `tax_amount` (`string`) - Tax Amount | example: `0`
      - `amount` (`string`) - Total Amount | example: `120000`
      - `cogs` (`string`) - Cost of Goods Sold | example: `78000`
      - `location_id` (`number`) - Location ID | example: `-1`

### Schema: `getSalesSettlementsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (16):
      - `cashbank_payment_id` (`number`) - Cashbank payment Id | example: `4`
      - `cashbank_payment_no` (`string`) - Cashbank payment no
      - `cashbank_receive_id` (`number`) - Cashbank receive Id | example: `118`
      - `cashbank_receive_no` (`string`) - Cashbank receive no | example: `REC-000000028`
      - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
      - `channel_id` (`number`) - The channel Id | example: `128`
      - `invoice_amount` (`string`) - Invoice amount | example: `0.00000`
      - `note` (`string`) - Note
      - `payment_amount` (`string`) - Payment amount | example: `0.00000`
      - `payment_id` (`number`) - Payment Id | example: `10`
      - `payment_no` (`string`) - Payment no
      - `receive_amount` (`string`) - Receive amount | example: `10811049.0000`
      - `settlement_header_id` (`number`) - Settlement header Id | example: `38`
      - `settlement_no` (`string`) - Settlement No | example: `STL-000000038`
      - `source` (`string`) - Source | example: `TOKOPEDIA - JubeCorner`
      - `store_id` (`string`) - Store ID | example: `23000`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getSalesSettlementResponse`

- **Type**: `object`
- **Properties** (8):
  - `invoice_amount` (`string`) - Invoice amount | example: `0.0000`
  - `note` (`string`) - Note
  - `payment_amount` (`string`) - Payment amount | example: `0.00000`
  - `receive_amount` (`string`) - Receive amount | example: `10811049.0000`
  - `settlement_header_id` (`number`) - Settlement header Id | example: `38`
  - `settlement_no` (`string`) - Settlement No | example: `STL-000000038`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `items` (`array of object`) - List Item in Purchase
    - **Array item properties** (13):
      - `account_id` (`number`) - Account Id | example: `1`
      - `account_name` (`string`) - Account Name | example: `1-1000 - Kas`
      - `adjust_amount` (`number`) - Adjust amount | example: `0`
      - `date` (`string`) | example: `2021-01-31T13:01:28.000Z`
      - `diff_amount` (`string`) - The different amount | example: `84843.0000`
      - `internal_invoice_amount` (`string`) - Internal invoice amount | example: `0.0000`
      - `invoice_id` (`number`) - Invoice ID | example: `22`
      - `invoice_no` (`string`) - Invoice Number | example: `INV-000000222`
      - `salesorder_id` (`number`) - Salesorder Id | example: `220`
      - `settlement_detail_id` (`number`) - settlement_detail_id | example: `8503`
      - `status` (`boolean`) - settlement_detail_id | example: `8503`
      - `store_order_amount` (`number`) - Store order amount | example: `84843.0000`
      - `store_ref_no` (`string`) - store ref no | example: `TP-INV/20210126/XXI/I/736301728`

### Schema: `changeLocationforOrders`

- **Type**: `object`
- **Required fields**: `ids`, `location_id`
- **Properties** (2):
  - `ids` (`array of string`)
  - `location_id` (`string`) - Location ID | example: `1`

### Schema: `shipmentsOrdersResponse`

- **Type**: `array`
- **Item properties** (17):
  - `salesorder_id` (`number`) - Sales order ID | example: `1`
  - `shipment_header_id` (`number`) - Shipment header ID | example: `1`
  - `salesorder_no` (`string`) - Reff number of Sales order | example: `SO-000000001`
  - `shipment_no` (`string`) - Reff number of Shipment | example: `SO-000000001`
  - `transaction_date` (`string`) - Transaction date | example: `2020-04-13T04:01:31.399Z`
  - `source` (`number`) - Channel ID | example: `1`
  - `shipment_date` (`string`) - Shipping date | example: `2020-04-13T04:01:31.399Z`
  - `shipping_full_name` (`string`) - Shipping full name
  - `shipping_full_address` (`string`) - Shipping full Address | example: `Jl. Jakarta`
  - `location_id` (`number`) - Location ID
  - `tracking_no` (`string`) - Tracking number | example: `AWB-00001`
  - `shipper` (`string`) - Shipper
  - `ticket_no` (`string`) - Ticker no
  - `marketplace_status` (`string`) - Marketplace status | example: `Pesanan berikut tidak memiliki kurir`
  - `courier_id` (`number`) - Courier ID
  - `shipment_type` (`string`) - Shipment type
  - `store_id` (`string`) - Store ID

### Schema: `getShopeeLogisticResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Status | example: `OK`
  - `data` (`array of object`) - List Logistics
    - **Array item properties** (6):
      - `weight_limits` (`object`)
      - `has_cod` (`boolean`) - Has COD | example: `False`
      - `logistic_name` (`string`) - Logistic Name | example: `JNE OKE`
      - `logistic_id` (`number`) - Logistic ID | example: `1`
      - `preferred` (`boolean`) - Is Preferred | example: `True`
      - `fee_type` (`number`) - Fee type | example: `SIZE_INPUT`

### Schema: `storeLocationsResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in Store Location
    - **Array item properties** (6):
      - `channel_name` (`string`) - The Channel Name | example: `TOKOPEDIA`
      - `location_id` (`number`) - The Location Id | example: `-1`
      - `location_name` (`string`) - The Location Name | example: `PUSAT`
      - `location_code` (`string`) - The Location Code | example: `PST`
      - `store_id` (`string`) - The Store Id | example: `6668`
      - `store_name` (`string`) - The Store Name | example: `Raicha Store`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `systemsettingAccountMappingResponse`

- **Type**: `object`
- **Properties** (39):
  - `ar_acct_id` (`number`) | example: `3`
  - `ap_acct_id` (`number`) | example: `14`
  - `sales_disc_acct_id` (`number`) | example: `29`
  - `retained_earning_acct_id` (`number`) | example: `25`
  - `invt_acct_id` (`number`) | example: `4`
  - `cogs_acct_id` (`number`) | example: `30`
  - `sales_acct_id` (`number`) | example: `32`
  - `purch_acct_id` (`number`) | example: `48`
  - `shipping_acct_id` (`number`) | example: `46`
  - `insurance_acct_id` (`number`) | example: `61`
  - `cash_acct_id` (`number`) | example: `1`
  - `bank_acct_id` (`number`) | example: `2`
  - `adjp_acct_id` (`number`) | example: `75`
  - `adjm_acct_id` (`number`) | example: `72`
  - `sales_add_disc_account_id` (`number`) | example: `76`
  - `sales_add_fee_account_id` (`number`) | example: `77`
  - `supplier_deposit_acct_id` (`number`) | example: `80`
  - `customer_deposit_acct_id` (`number`) | example: `1`
  - `service_fee_account_id` (`number`) | example: `83`
  - `ar_account_name` (`string`) | example: `1-1100 - Piutang Usaha`
  - `ap_account_name` (`string`) | example: `2-2000 - Hutang Usaha`
  - `sales_disc_account_name` (`string`) | example: `4-4001 - Diskon Penjualan`
  - `retained_earning_account_name` (`string`) | example: `3-3001 - Laba Ditahan`
  - `historical_bal_account_name` (`string`) | example: `3-3003 - Pengimbang Neraca`
  - `invt_account_name` (`string`) | example: `1-1200 - Persediaan Barang`
  - `cogs_account_name` (`string`) | example: `5-5000 - Harga Pokok Penjualan (COGS)`
  - `sales_account_name` (`string`) | example: `4-4000 - Penjualan`
  - `purch_account_name` (`string`) | example: `6-6017 - Biaya Administrasi & Umum Lainnya`
  - `shipping_account_name` (`string`) | example: `7-7005 - Ongkos Kirim`
  - `insurance_account_name` (`string`) | example: `6-6030 - Asuransi`
  - `cash_account_name` (`string`) | example: `1-1000 - Kas`
  - `bank_account_name` (`string`) | example: `1-1001 - Bank`
  - `adjp_account_name` (`string`) | example: `7-7004 - Penyesuaian Persediaan Barang`
  - `adjm_account_name` (`string`) | example: `8-8004 - Penyesuaian Persediaan Barang`
  - `sales_add_disc_account_name` (`string`) | example: `4-4002 - Diskon Lainnya`
  - `sales_add_fee_account_name` (`string`) | example: `8-8006 - Biaya Penjualan Lainnya`
  - `supplier_deposit_account_name` (`string`)
  - `customer_deposit_account_name` (`string`)
  - `service_fee_account_name` (`string`) | example: `8-8035 - Biaya Layanan`

### Schema: `getSystemSettingUserResponse`

- **Type**: `object`
- **Properties** (1):
  - `data` (`array of object`)
    - **Array item properties** (4):
      - `user_id` (`number`) - User ID | example: `61382`
      - `email` (`string`) | example: `lilismanoban@blackpick.com`
      - `last_login` (`string`) | example: `2022-03-21T07:30:17.362Z`
      - `is_owner` (`boolean`) | example: `False`

### Schema: `saveWebhookRequest`

- **Type**: `object`
- **Required fields**: `webhooks`
- **Properties** (1):
  - `webhooks` (`array of object`) - List Items in Webhooks
    - **Array item properties** (2):
      - `action` (`string`) - Action Type ('secret-key', 'update-product', 'update-salesorder', 'update-purchaseorder', 'new-salesreturn', 'new-stocktransfer', 'update-qty', 'updat | example: `update-product`
      - `url` (`string`) - Webhook URL | example: `https://enopl9pouhy4h.x.pipedream.net`

### Schema: `getLazadaShipmentProvidersResponse`

- **Type**: `array`
- **Item properties** (4):
  - `name` (`string`) - Shipment Provider Name | example: `JNE`
  - `cod` (`number`) | example: `1`
  - `is_default` (`number`) | example: `1`
  - `api_integration` (`number`) | example: `1`

### Schema: `getReportsWMSPicklistResponse`

- **Type**: `object`
- **Properties** (3):
  - `status` (`string`) - status | example: `ok`
  - `url` (`string`) - URL | example: `https://report.jubelio.com/?&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXBv`
  - `title` (`string`) - Title | example: `Picklist Gudang`

### Schema: `postWMSOrderGetOrderByNoRequest`

- **Type**: `object`
- **Required fields**: `salesorder_no`
- **Properties** (1):
  - `salesorder_no` (`string`) - Sales Order No. | example: `LZ-695749998829055`

### Schema: `postWMSOrderGetOrderByNoResponse`

- **Type**: `object`
- **Properties** (16):
  - `salesorder_id` (`number`) - Sales Order ID | example: `249913`
  - `salesorder_no` (`string`) - Sales Order No. | example: `SO-002499913`
  - `transaction_date` (`string`) - Transaction Date | example: `2022-02-22T03:33:26.024Z`
  - `contact_id` (`number`) - Contact ID | example: `2034362`
  - `customer_name` (`string`) - Customer Name | example: `Deni Gentong`
  - `grand_total` (`number`) - Grand Total | example: `130000`
  - `shipper` (`string`) - Shipper | example: `Grab Instant`
  - `store_name` (`string`) - store name | example: `LAZADA - INDOBABYH`
  - `dropshipper` (`string`) - Dropshipper | example: `Toko Sejahtera`
  - `location_id` (`number`) - Location ID | example: `1`
  - `qty` (`number`)
  - `due_date` (`number`) - Due Date
  - `location_name` (`string`) - Location Name | example: `Gudang Besar`
  - `total_qty` (`number`) - Total Quantity | example: `100`
  - `is_canceled` (`boolean`)
  - `internal_status` (`string`) - Internal Status | example: `PAID`

### Schema: `postWMSShipmentsGetOrderRequest`

- **Type**: `object`
- **Required fields**: `shipment_detail_id`, `salesorder_id`
- **Properties** (2):
  - `shipment_detail_id` (`number`) - Shipment Detail ID | example: `594616`
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499908`

### Schema: `postWMSShipmentsGetOrderResponse`

- **Type**: `object`
- **Properties** (4):
  - `status` (`string`) - Status | example: `ok`
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499908`
  - `is_canceled` (`boolean`) | example: `False`
  - `internal_status` (`string`) | example: `PROCESSING`

### Schema: `postSalesShipmentsRequest`

- **Type**: `object`
- **Required fields**: `shipment_header_id`, `shipment_no`, `courier_id`, `transaction_date`, `location_id`, `shipment_type`, `items`, `is_completed`
- **Properties** (9):
  - `shipment_header_id` (`number`) - Shipment Header ID | example: `10492`
  - `shipment_no` (`string`) - Shipment No. | example: `SHP-000010492`
  - `courier_id` (`number`) - Courier ID | example: `1`
  - `transaction_date` (`string`) | example: `2022-02-24T09:19:29.029Z`
  - `note` (`string`)
  - `location_id` (`number`) - Location ID | example: `2`
  - `shipment_type` (`string`) - Shipment Type | example: `2`
  - `items` (`array of object`)
    - **Array item properties** (4):
      - `shipment_detail_id` (`number`) - Shipment Detail ID | example: `594616`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499908`
      - `tracking_no` (`string`) - Tracking No.
      - `is_picked` (`boolean`) | example: `True`
  - `is_completed` (`boolean`) | example: `True`

### Schema: `postSalesShipmentsResponse`

- **Type**: `object`
- **Properties** (1):
  - `id` (`number`) - Shipment Header ID | example: `10492`

### Schema: `postSalesPicklistsItemToPickRequest`

- **Type**: `object`
- **Required fields**: `ids`
- **Properties** (1):
  - `ids` (`array of number`) - salesorder_id

### Schema: `postSalesPicklistsItemToPickResponse`

- **Type**: `array`
- **Item properties** (14):
  - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `5533753`
  - `item_id` (`number`) - Item ID | example: `56586`
  - `item_full_name` (`string`) - Item Full Name | example: `BY-SY-06/POOH - [BISA COD] Sepatu Bayi New Born Kaos Kaki Bayi Laki-Laki Bayi Pe`
  - `use_batch_number` (`boolean`) - Batch Number | example: `False`
  - `use_serial_number` (`boolean`) - Serial Number | example: `False`
  - `location_id` (`number`) - Location ID | example: `1`
  - `location_name` (`string`) - Location Name | example: `Gudang Besar`
  - `qty_ordered` (`number`) - Quantity Number | example: `1`
  - `unit` (`string`) - Unit | example: `Buah`
  - `salesorder_id` (`number`) - Sales Order ID | example: `2499718`
  - `salesorder_no` (`number`) - Sales Order No. | example: `LZ-8921983`
  - `bundle_item_id` (`number`) - Bundle Item ID | example: `0`
  - `end_qty` (`number`) - End Quantity | example: `50`
  - `thumbnail` (`string`) - Thumbnail | example: `https://jubelio.blob.core.windows.net/images/0swqgtzyqwoti4bwbawsvq/3d282c74478f`

### Schema: `postWMSSalesCreatePicklistsRequest`

- **Type**: `object`
- **Required fields**: `picklist_id`, `picklist_no`, `is_completed`, `items`, `picker_id`, `salesorderIds`, `is_warehouse`
- **Properties** (7):
  - `picklist_id` (`number`) - To Create, set value as 0. | example: `0`
  - `picklist_no` (`string`) - Picklist No. | example: `[auto]`
  - `is_completed` (`boolean`) - Whether the picking process is already done | example: `False`
  - `items` (`array of object`)
    - **Array item properties** (6):
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `5533730`
      - `item_id` (`number`) - Item ID. if item is a bundle product, set the value with their bundling **item_id**. | example: `56801`
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty_ordered` (`number`) - Qty Ordered | example: `10`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499709`
      - `bundle_item_id` (`number`) - Bundle Item ID, 0 = if item is not a bundle product. Set value as item_id if item is a bundle product. | example: `0`
  - `picker_id` (`string`) - Email of the Picker Staff | example: `juberlians@jubelio.com`
  - `salesorderIds` (`array of object`)
  - `is_warehouse` (`boolean`) - If the location is the warehouse | example: `True`

### Schema: `postWMSSalesUpdatePicklistsRequest`

- **Type**: `object`
- **Required fields**: `picklist_id`, `picklist_no`, `is_completed`, `items`, `is_warehouse`
- **Properties** (6):
  - `picklist_id` (`number`) - Picklist ID | example: `32462`
  - `picklist_no` (`string`) - Picklist No. | example: `PICK-000032462`
  - `note` (`string`) - note
  - `is_completed` (`boolean`) - If the picking process is already done | example: `True`
  - `items` (`array of object`)
    - **Array item properties** (11):
      - `bin_id` (`number`) - Bin ID | example: `2`
      - `bundle_item_id` (`number`) - Bundle Item ID, 0 = if item is not a bundle product. Set value as item_id if item is a bundle product. | example: `0`
      - `item_id` (`number`) - Item ID. if item is a bundle product, set the value with their bundling **item_id** | example: `51135`
      - `location_id` (`number`) - Location ID | example: `1`
      - `picklist_detail_id` (`number`) - Picklist Detail ID | example: `4323390`
      - `qty_ordered` (`number`) - Quantity that needs to pick | example: `10`
      - `qty_picked` (`number`) - Quantity done picking | example: `10`
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `5533737`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499712`
      - `invoice_no` (`string`) - Invoice No.
      - `update` (`boolean`) - boolean | example: `False`
  - `is_warehouse` (`boolean`) - If the location is the warehouse | example: `True`

### Schema: `postWMSSalesCreatePicklistsAutoComplete`

- **Type**: `object`
- **Required fields**: `is_completed`, `is_warehouse`, `items`, `merge_location`, `picker_id`, `picklist_id`, `picklist_no`, `salesorderIds`
- **Properties** (8):
  - `is_completed` (`boolean`) - Whether the picking process is already done
  - `is_warehouse` (`boolean`) - If the location is the warehouse | example: `True`
  - `items` (`array of object`)
    - **Array item properties** (9):
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `5533730`
      - `item_id` (`number`) - Item ID. if item is a bundle product, set the value with their bundling **item_id**. | example: `56801`
      - `location_id` (`number`) - Location ID | example: `1`
      - `qty_ordered` (`number`) - Qty Ordered | example: `10`
      - `qty_picked` (`number`) - Qty Picked | example: `10`
      - `salesorder_id` (`number`) - Sales Order ID | example: `2499709`
      - `bundle_item_id` (`number`) - Bundle Item ID, 0 = if item is not a bundle product. Set value as item_id if item is a bundle product. | example: `0`
      - `package_detail_id` (`number`) - Package Detail ID | example: `0`
      - `package_id` (`number`) - Package ID | example: `0`
  - `merge_location` (`boolean`) - Merge Location | example: `False`
  - `picker_id` (`string`) - Email of the Picker Staff | example: `juberlians@jubelio.com`
  - `picklist_id` (`number`) - To Create, set value as 0. | example: `0`
  - `picklist_no` (`string`) - Picklist No. | example: `[auto]`
  - `salesorderIds` (`array of object`)

### Schema: `postWMSSalesPicklistsResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - status | example: `ok`
  - `data` (`object`)
    - `picks` (`array of object`)
    - `invalidSO` (`array of object`)

### Schema: `postWMSSalesCreatePacklistsRequest`

- **Type**: `object`
- **Required fields**: `salesorder_no`, `salesorder_id`, `packer_id`, `packlist_id`, `packlist_no`
- **Properties** (5):
  - `salesorder_no` (`string`) - Sales Order No | example: `SO-000191533`
  - `salesorder_id` (`number`) - Sales Order ID | example: `191533`
  - `packer_id` (`number`) - Packer ID | example: `dewi@gmail.com`
  - `packlist_id` (`number`) - Packlist ID. To create, set as 0.
  - `packlist_no` (`string`) - Packlist No | example: `PACK-00000428`

### Schema: `postWMSSalesPacklistsResponse`

- **Type**: `object`
- **Properties** (8):
  - `packlist_id` (`number`) - Packlist ID | example: `4283`
  - `packlist_no` (`string`) - Picklist No. | example: `PACK-000004283`
  - `packer_id` (`string`) - Packer ID | example: `dewi@gmail.com`
  - `tracking_number` (`string`) - Tracking Number
  - `salesorder_id` (`number`) - Sales Order ID | example: `181344`
  - `salesorder_no` (`string`) - Sales Order No | example: `SO-000181344`
  - `items` (`array of object`)
    - **Array item properties** (13):
      - `packlist_detail_id` (`number`) - Packlist Detail ID | example: `7255`
      - `item_id` (`number`) - Item ID | example: `1611`
      - `item_code` (`string`) - Item Code | example: `TRS-114/DRESS+BANDO/YELLOW-BROWN`
      - `variation_name` (`string`) - variation Name
      - `item_name` (`string`) - Item Name | example: `RS-114/DRESS+BANDO/YELLOW-BROWN - [COD] Baju Bayi Perempuan + Bando TRS-114 / Ba`
      - `qty_ordered` (`number`) - Qty Ordered | example: `10`
      - `qty_packed` (`number`) - Qty packed | example: `0`
      - `salesorder_detail_id` (`number`) - Sales Order detail ID | example: `21626`
      - `package_id` (`number`) - Package ID
      - `image` (`array of object`)
      - `item_group_id` (`number`) - Item Group ID | example: `608`
      - `thumbnail` (`array`) - Thumbnail | example: `79ea1c46-93e0-43c9-af6a-e156df4c56c1.jpg`
      - `package_no` (`string`) - Package No
  - `total_items` (`number`) - Total Items | example: `2`

### Schema: `systemsettingTaxesResponse`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (5):
      - `rate` (`string`) | example: `10.00`
      - `tax_id` (`number`) | example: `-1`
      - `tax_in` (`string`) | example: `1-1303 PPN Masukan`
      - `tax_name` (`string`) | example: `PPN`
      - `tax_out` (`string`) | example: `2-2103 PPN Pengeluaran`
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `getTokopediaShowcasesResponse`

- **Type**: `object`
- **Properties** (2):
  - `status` (`string`) - Status | example: `OK`
  - `etalase` (`array of object`) - List Etalase
    - **Array item properties** (2):
      - `etalase_id` (`number`) - Etalase ID | example: `1`
      - `etalase_name` (`number`) - Etalase Name | example: `PHONE CASE`

### Schema: `getVariations`

- **Type**: `object`
- **Properties** (2):
  - `data` (`array of object`) - List Items that exists in System
    - **Array item properties** (25):
      - `item_category_id` (`number`) - Item Category ID | example: `100`
      - `brand_id` (`number`) - Brand ID | example: `169798`
      - `brand_name` (`string`) - Brand Name | example: `ASUS`
      - `item_group_id` (`number`) - Item Group ID | example: `34`
      - `item_group_name` (`string`) - Item Group Name | example: `LAPTOP ASUS ROG - BLACK`
      - `created_date` (`string`) - Create date | example: `2020-07-01T17:00:00.000Z`
      - `variations` (`array of object`)
      - `item_id` (`number`) - Item ID | example: `9`
      - `item_code` (`string`) - SKU | example: `BAR-LAP-13`
      - `item_name` (`string`) - Item Name | example: `Barang Laptop`
      - `variation_values` (`array of object`)
      - `barcode` (`string`) - Barcode
      - `is_bundle` (`boolean`) - Is bundle | example: `False`
      - `rop` (`number`) - Return of Purchase | example: `0`
      - `lead_time` (`number`) - default is 0 | example: `0`
      - `rack_no` (`number`) - Rack Number
      - `package_weight` (`number`) - Package Weight | example: `50`
      - `store_priority_qty_treshold` (`number`) - Store Priority Treshold | example: `2`
      - `sell_price` (`number`) - Sell price | example: `12000000`
      - `end_qty` (`number`) - End QTY | example: `1`
      - `average_cost` (`number`) - Average Cost
      - `is_variant` (`boolean`) - Is Variant | example: `True`
      - `is_unlimited_stock` (`boolean`) - Is Unlimited Stock | example: `False`
      - `last_modified` (`string`) - Create date | example: `2020-07-01T17:00:00.000Z`
      - `channels` (`array of object`) - Channel list
  - `totalCount` (`number`) - Total Count of All Items | example: `1`

### Schema: `webhookInvoice`

- **Type**: `object`
- **Properties** (4):
  - `action` (`string`) - Action Name | example: `hook-invoice`
  - `invoice_id` (`number`) - Invoice ID | example: `1`
  - `invoice_no` (`string`) - Invoice Number | example: `INV-000000001`
  - `ref_no` (`string`) - Refference Number | example: `SO-000000001`

### Schema: `webhookPayment`

- **Type**: `object`
- **Properties** (4):
  - `action` (`string`) - Action Name | example: `hook-payment`
  - `payment_id` (`number`) - Payment ID | example: `168`
  - `payment_no` (`string`) - Payment Number | example: `CP-0000090`
  - `invoices` (`array of object`) - List Invoices
    - **Array item properties** (2):
      - `payment_id` (`number`) - Payment Id | example: `CF013037-123123`
      - `invoice_id` (`number`) - Invoice Id for this Payment | example: `-3`

### Schema: `webhookPrice`

- **Type**: `object`
- **Properties** (3):
  - `action` (`string`) - Action Name | example: `update-price`
  - `item_group_id` (`number`) - Item Group ID | example: `1`
  - `item_group_name` (`string`) - Item Group Name | example: `Test barang`

### Schema: `webhookProduct`

- **Type**: `object`
- **Properties** (3):
  - `action` (`string`) - Action Name | example: `update-product`
  - `item_group_id` (`number`) - Item Group ID | example: `1`
  - `item_group_name` (`string`) - Item Group Name | example: `Test barang`

### Schema: `webhookPurchaseOrder`

- **Type**: `object`
- **Properties** (4):
  - `action` (`string`) - Action Name | example: `new-purchaseorder`
  - `purchaseorder_id` (`number`) - Purchase Order ID | example: `1`
  - `purchaseorder_no` (`string`) - Purchase Order Number | example: `ORDER-001`
  - `status` (`string`) - Status | example: `CREATED`

### Schema: `webhookSalesOrder`

- **Type**: `object`
- **Properties** (156):
  - `action` (`string`) - Action Name | example: `update-salesorder`
  - `salesorder_id` (`number`) - Sales Order ID | example: `1`
  - `salesorder_no` (`string`) - Sales Order Number | example: `WB000000001`
  - `source` (`string`) - Source | example: `WEBSTORE`
  - `store` (`string`) - Store Name | example: `WEBSTORE`
  - `status` (`string`) - Sales Order Status | example: `Created`
  - `contact_id` (`number`) - Contact ID (Customer) | example: `1`
  - `customer_name` (`string`) - Contact Name (Customer) | example: `Radit`
  - `customer_phone` (`string`) - Contact Phone (Customer) | example: `8111111111`
  - `customer_email` (`string`) - Contact Email (Customer) | example: `test@jubelio.com`
  - `payment_date` (`string`) - Payment Date | example: `2018-10-20T17:00:00.000Z`
  - `transaction_date` (`string`) - Transaction Date | example: `2018-10-20T17:00:00.000Z`
  - `created_date` (`string`) - Created Date | example: `2018-10-20T17:00:00.000Z`
  - `invoice_id` (`number`) - Invoice ID | example: `22`
  - `invoice_no` (`string`) - Invoice Number | example: `INV-000000222`
  - `is_tax_included` (`boolean`) - Whether Tax Included | example: `False`
  - `note` (`string`) - Sales Order note | example: `Tlg packingan yg aman ya kk`
  - `sub_total` (`number`) - Sub Total | example: `120000`
  - `total_disc` (`number`) - Total Discount | example: `0`
  - `total_tax` (`number`) - Total Tax | example: `0`
  - `grand_total` (`number`) - Grand Total | example: `120000`
  - `ref_no` (`string`) - Reference Number | example: `99`
  - `payment_method` (`string`) - Reference Number | example: `cod`
  - `location_id` (`number`) - Header Location ID | example: `-1`
  - `is_canceled` (`boolean`) - Whether So is canceled | example: `False`
  - `cancel_reason` (`string`) - Cancel Reason | example: `Tidak Punya Uang`
  - `cancel_reason_detail` (`string`) - Cancel Reason Detail | example: `Tidak Punya Uang`
  - `channel_status` (`string`) - Channel Status | example: `Pending`
  - `shipping_cost` (`number`) - Shipping Cost | example: `5000`
  - `insurance_cost` (`number`) - Insurance Cost | example: `5000`
  - `is_paid` (`boolean`) - Whether so is paid | example: `True`
  - `shipping_full_name` (`string`) - Shipping Full Name (Receiver Name) | example: `Radit`
  - `shipping_phone` (`string`) - Shipping Phone (Receiver) | example: `87788124444`
  - `shipping_address` (`string`) - Shipping Address | example: `Kutabumi`
  - `shipping_area` (`string`) - Shipping Area | example: `Pasar Kemis`
  - `shipping_city` (`string`) - Shipping City | example: `Tangerang`
  - `shipping_province` (`string`) - Shipping Province | example: `Banten`
  - `shipping_post_code` (`string`) - Shipping Post COde | example: `11750`
  - `shipping_country` (`string`) - Shipping Country | example: `Indonesia`
  - `last_modified` (`string`) - Last Modified | example: `2020-04-08T13:30:05.319Z`
  - `register_session_id` (`number`) - Register Session ID | example: `1`
  - `user_name` (`string`) - User Name | example: `user`
  - `ordprdseq` (`string`) - .
  - `store_id` (`string`) - Store ID | example: `1`
  - `marked_as_complete` (`string`) - Mark as Complete
  - `is_tracked` (`string`) - Is Tracked
  - `store_so_number` (`string`) - Store SO Number
  - `is_deleted_from_picklist` (`boolean`) - Deleted from picklist | example: `False`
  - `deleted_from_picklist_by` (`string`) - Deleted from picklist by | example: `username`
  - `dropshipper` (`string`) - Dropshipper
  - `dropshipper_note` (`string`) - Dropshipper Note
  - `dropshipper_address` (`string`) - Dropshipper Address
  - `is_shipped` (`string`) - Is Shipped
  - `due_date` (`string`) - Due date
  - `received_date` (`string`) - Received date | example: `2020-04-08T13:30:05.319Z`
  - `salesmen_id` (`number`) - Salesmen ID | example: `1`
  - `salesmen_name` (`string`) - Salesmen Name | example: `salesname`
  - `escrow_amount` (`string`) - Escrow amount
  - `is_acknowledge` (`boolean`) - Is acknowledge | example: `True`
  - `acknowledge_status` (`string`) - Acknowledge status
  - `is_label_printed` (`boolean`) - Label printed | example: `True`
  - `is_invoice_printed` (`boolean`) - Invoice printed | example: `False`
  - `total_amount_mp` (`number`) - Total Amount Marketplace
  - `internal_do_number` (`string`) - Internal DO number
  - `internal_status` (`string`) - Internal Status | example: `PROCESSING`
  - `internal_so_number` (`string`) - Internal SO number
  - `tracking_number` (`string`) - Tracking number
  - `courier` (`string`) - Courier | example: `J&T REG`
  - `username` (`string`) - Username | example: `user`
  - `is_po` (`boolean`) - Is PO | example: `False`
  - `picked_in` (`string`) - Picked In
  - `district_cd` (`string`) - District CD
  - `sort_code` (`string`) - Sort Code
  - `shipment_type` (`string`) - Shipment Type
  - `status_details` (`string`) - Status detail
  - `service_fee` (`string`) - Service fee | example: `0.0000`
  - `source_name` (`string`) - Channel name | example: `INTERNAL`
  - `store_name` (`string`) - Store name | example: `Store Name`
  - `location_name` (`string`) - Header Location Name | example: `Pusat`
  - `shipper` (`string`) - Shipper | example: `J&T REG`
  - `tracking_no` (`string`) - Tracking Number / AWB | example: `2958792875272589000`
  - `add_disc` (`number`) - Additional Discount | example: `0`
  - `add_fee` (`number`) - Additional Fee | example: `0`
  - `total_weight_in_kg` (`string`) - The weight of order in KG | example: `0.30`
  - `is_cod` (`boolean`) - Whether COD or not | example: `False`
  - `disc_marketplace` (`string`) - Discount marketplace | example: `0`
  - `is_canceled_item` (`string`) - Whether so is canceled item
  - `is_bundle` (`boolean`) - Whether so is bundle | example: `False`
  - `weight_in_gram` (`number`) | example: `450`
  - `loc_name` (`string`) - Location name | example: `Pusat`
  - `dlvmthdcd` (`string`) - dlvmthdcd
  - `dlvetprscd` (`string`) - dlvetprscd
  - `dlvetprsnm` (`string`) - dlvetprsnm
  - `dlvno` (`string`) - dlvno
  - `closure_id` (`string`) - Closure ID
  - `tn_created_date` (`string`) - tn_created_date
  - `location_tax` (`string`) - Location Tax
  - `location_discount` (`string`) - Location Discount
  - `mp_timestamp` (`string`) - MP timestamp
  - `mp_cancel_reason` (`string`) - MP cancel reason
  - `mp_cancel_by` (`string`) - MP cancel by
  - `mp_cancel_date` (`string`) - MP cancel by
  - `label_printed_count` (`string`) - Label printed count
  - `package_count` (`string`) - Package count
  - `pickup_time_id` (`string`) - Pickup time ID
  - `pickup_time_value` (`string`) - Pickup time value
  - `is_escrow_updated` (`string`) - Whether escrow updated
  - `pos_outlet_discount` (`string`) - POS outlet discount
  - `pos_promotion_discount` (`string`) - POS promotion discount
  - `pos_cashier_input_discount` (`string`) - POS cashier input discount
  - `pos_payment_fee` (`string`) - POS payment fee
  - `pos_payment_charge` (`string`) - POS payment charge
  - `is_instant_courier` (`string`) - Whether instant courier | example: `False`
  - `dealpos_sales_note` (`string`) - Dealpos sales note
  - `dealpos_sales_type` (`string`) - Dealpos sales type
  - `shipping_provider_type` (`string`) - Shipping provider type
  - `is_fast_shiping_lz` (`string`) - Whether fast shipping lz
  - `pos_is_shipping` (`string`) - Whether pos is shipping | example: `False`
  - `shipping_subdistric` (`string`) - Shipping subdistric | example: `Setiabudi`
  - `shipping_province_id` (`number`) - Shipping province ID | example: `31`
  - `shipping_city_id` (`number`) - Shipping city ID | example: `3174`
  - `shipping_district_id` (`number`) - Shipping district ID | example: `317402`
  - `shipping_subdistrict_id` (`number`) - Shipping subdistrict ID | example: `3174021001`
  - `shipping_coordinate` (`string`) - Shipping coordinate
  - `awb_printed_count` (`number`) - AWB printed count | example: `0`
  - `sub_status` (`string`) - Sub status
  - `wms_status` (`string`) - WMS status | example: `PAID`
  - `zone_name` (`string`) - Zone name
  - `zone_id` (`string`) - Zone ID
  - `override_courier` (`string`) - Override courier
  - `failed_order_date` (`string`) - Failed order date
  - `warehouse_type` (`string`) - Warehouse type
  - `voucher_amount` - Voucher amount
  - `original_shipment_cost` (`number`) - Original shipment cost | example: `0`
  - `is_tokopedia_plus` (`string`) - Whether tokopedia plus
  - `use_shipping_insurance` (`string`) - Use shipping insurance | example: `False`
  - `shipment_promotion_id` (`string`) - Shipment promotion ID
  - `shipping_cost_discount` (`number`) - Shipping cost discount | example: `0`
  - `priority_fulfillment_tag` (`string`) - Priority fulfillment tag
  - `fulfillment_sla` (`string`) - Fulfillment sla
  - `is_sameday` (`string`) - Whether sameday
  - `return_zone_id` (`string`) - Return zone ID
  - `internal_cancel_date` (`string`)
  - `is_edit_value` (`string`) - Whether is edit or not | example: `True`
  - `extra_info` (`string`) - Extra info
  - `picklist_exist` (`string`) - Picklist exist | example: `False`
  - `picklist_completed` (`string`) - Picklist completed
  - `picker` (`string`) - Picker
  - `is_payment_gateway_invoice_paid` (`string`) - Whether payment gateway invoice paid or not
  - `payment_url` (`string`) - Payment URL
  - `buyer_shipping_cost` (`number`) - Buyer shipping cost | example: `0`
  - `discount_marketplace` (`number`) - Discount marketplace | example: `0`
  - `salesman_name` (`string`) - Salesman name | example: `Radit`
  - `location_code` (`string`) - Location code | example: `Pusat`
  - `picklist_no` (`string`) - Picklist No
  - `items` (`array of object`) - List Item in Purchase
    - **Array item properties** (37):
      - `salesorder_detail_id` (`number`) - Sales Order Detail ID | example: `0`
      - `item_id` (`number`) - Item ID | example: `14`
      - `serial_no` (`string`) - Serial Number | example: `SN001`
      - `description` (`string`) - Item Description | example: `Kaos DreamCatcher Born to Be Yours`
      - `tax_id` (`number`) - Tax ID | example: `1`
      - `price` (`number`) - Item Price | example: `120000`
      - `unit` (`string`) - Unit Name | example: `Buah`
      - `qty_in_base` (`number`) - Quantity that will be order | example: `1`
      - `disc` (`number`) - Item Discount | example: `0`
      - `disc_amount` (`number`) - Item Discount Amount | example: `0`
      - `tax_amount` (`number`) - Item Tax Amount | example: `0`
      - `amount` (`number`) - Item Total Amount | example: `120000`
      - `location_id` (`number`) - Item Location ID | example: `-1`
      - `shipper` (`string`) - Shipper | example: `J&T REG`
      - `qty` (`number`) - Quantity | example: `1`
      - `uom_id` (`number`) | example: `-1`
      - `shipped_date` (`string`)
      - `channel_order_detail_id` (`number`)
      - `is_return_resolved` (`boolean`) - Return is resolved | example: `False`
      - `reject_return_reason` (`string`) - Reject return reason
      - `awb_created_date` (`string`) - awb created date
      - `ticket_no` (`string`)
      - `pack_scanned_date` (`string`)
      - `pick_scanned_date` (`string`)
      - `destination_code` (`string`)
      - `origin_code` (`string`)
      - `status` (`string`)
      - `item_code` (`string`) - Item code | example: `brg001`
      - `item_name` (`string`) - Item name | example: `Barang 1`
      - `sell_price` (`number`) - Sell price | example: `Barang 1`
      - `original_price` (`string`) - Original price | example: `10.000`
      - `rate` (`string`) | example: `0.00`
      - `tax_name` (`string`) - Tax name | example: `No Tax`
      - `item_group_id` (`number`) - . | example: `1`
      - `loc_id` (`number`) - .
      - `thumbnail` (`string`) - Thumbnail link | example: `https://truzteedev.blob.core.windows.net/images/rxayuyour32vvi5jygo4eq/cc05d0ef-`
      - `fbm` (`string`) - .

### Schema: `webhookSalesReturn`

- **Type**: `object`
- **Properties** (3):
  - `action` (`string`) - Action Name | example: `new-salesreturn`
  - `return_id` (`number`) - Return ID | example: `1`
  - `return_no` (`string`) - Return Number | example: `SR-000000001`

### Schema: `webhookStock`

- **Type**: `object`
- **Properties** (5):
  - `action` (`string`) - Action Name | example: `update-qty`
  - `item_group_id` (`number`) - Item Group ID | example: `1`
  - `item_group_name` (`string`) - Item Group Name | example: `Test barang`
  - `item_ids` (`array of number`)
  - `location_id` (`number`) - Location ID | example: `2`

### Schema: `webhookStockTransfer`

- **Type**: `object`
- **Properties** (5):
  - `action` (`string`) - Action Name | example: `new-stocktransfer`
  - `item_transfer_id` (`number`) - Item Transfer ID | example: `1`
  - `item_transfer_no` (`string`) - Item Transfer Number | example: `TRF-000000001`
  - `status` (`string`) - Status | example: `CREATED`
  - `created_by` (`string`) - Created By (Name) | example: `support team`

---

## Webhook Events

Available webhook events (all use POST method):

| Event | Path | Schema |
|-------|------|--------|
| New Invoice | `/webhooks/invoice` | `ok` |
| Update Payment | `/webhooks/payment` | `ok` |
| Update Price | `/webhooks/price` | `ok` |
| New Product | `/webhooks/product` | `ok` |
| New Purchase Order | `/webhooks/purchaseorder` | `ok` |
| Update Sales Order | `/webhooks/salesorder` | `ok` |
| New Sales Return | `/webhooks/salesreturn` | `ok` |
| Update Stock | `/webhooks/stock` | `ok` |
| New Stock Transfer | `/webhooks/stocktransfer` | `ok` |

---

## API Workflow Guides

### Product Creation Workflow

**Without variant:**
1. `GET /inventory/categories/item-categories/` -> get `category_id`
2. `GET /inventory/search-brands/` -> get `brand_id`, `brand_name`
3. `POST /inventory/upload-image` -> get `key`, `url`, `thumbnail`
4. `POST /inventory/catalog/` -> create product (use `createProductRequest` schema)

**Single/Multi-variant:**
- Use `createSingleorMultiVariantProductRequest` schema
- Add variations array for multi-variant products

### Product Bundle Creation

1. `GET /inventory/items/to-sell/{location_id}` -> get item details
2. `GET /inventory/categories/item-categories/` -> get `category_id`
3. `POST /inventory/items/` -> create bundle (set `is_bundle: true`)

### Product Listing (Push to Marketplace)

1. `GET /inventory/items/reviews/` or `GET /inventory/items/masters` -> get `item_group_id`
2. `GET /inventory/catalog/for-listing/{id}` -> get item details
3. `POST /inventory/catalog/listing` -> create listing
4. `POST /inventory/catalog/upload` -> upload to marketplace

### Stock Adjustment & Opname

### Stock Adjustment Workflow

1. `GET /inventory/items/to-stock/` -> get `item_id`
2. `GET /systemsetting/account-mapping` -> get `adjm_acct_id`/`adjp_acct_id`
3. `GET /locations/` -> get `location_id`
4. `GET /inventory/stock-opname/bins` -> get `bin_id`
5. `POST /inventory/adjustments/` -> adjust stock

### Stock Opname Workflow

1. `GET /systemsetting/users/` -> get user email for `process_by`
2. `GET /locations/` -> get `location_id`
3. `GET /inventory/stock-opname/floors` -> get `floor_id`
4. `GET /inventory/stock-opname/rows` -> get `row_id`
5. `GET /inventory/stock-opname/columns` -> get `column_id`
6. `GET /inventory/stock-opname/items/filtered` -> get items by rack
7. `GET /inventory/stock-opname/items` -> get all items to opname
8. `POST /inventory/stock-opname` -> create opname list
9. `GET /reports/stock-opname` -> print opname list
10. `POST /inventory/stock-opname/finalize` -> finalize & push stock

### Inbound: Purchase Order -> Receive -> Putaway

**Create PO:**
1. `GET /contacts/suppliers/` -> get `contact_id`, `contact_name`
2. `GET /locations/` -> get `location_id`
3. `GET /inventory/items/to-buy` -> get `item_id`, `item_name`
4. `POST /purchase/orders/` -> create PO

**Receive from PO:**
1. `GET /purchase/orders/` -> get `purchaseorder_id`
2. `GET /purchase/orders/{id}` -> get all properties
3. `POST /purchase/bills/` -> receive items

**Auto Putaway:**
1. `GET /inventory/items/received` -> get `trx_id`
2. `POST /inventory/items/received/auto-putaway` -> auto place items

**Manual Putaway:**
1. Assign staff: `GET /wms/employee/{NIKorEmail}` -> `POST /inventory/items/received/author`
2. `GET /inventory/putaway/all` -> get `putaway_id`
3. `GET /inventory/items/received/item/{putaway_id}` -> get `item_id`
4. `GET /wms/default-bin/{location_id}` or `GET /locations/bin/{location_id}` -> get `bin_id`
5. `POST /inventory/items/received/putaway` -> place items

### Inbound: Transfer In

1. `GET /inventory/transfers/all-transit` -> get `item_transfer_id`
2. `GET /inventory/items/by-transfer/{item_transfer_id}` -> get item details
3. `POST /inventory/transfers/` -> receive transfer

### Inbound: Sales Return

**With invoice:**
1. `GET /contacts/customers/` -> get `contact_id`
2. `GET /sales/invoices/for-return-wms/{contact_id}` -> get `invoice_id`
3. `GET /inventory/items/by-invoice/{invoice_id}` -> get items
4. `GET /locations/` -> get `location_id`
5. `POST /sales/sales-returns/` -> receive return

**Without invoice:**
1. `GET /contacts/customers/` -> get `contact_name`
2. `GET /inventory/items/to-sales-return` -> get items
3. `GET /locations/` -> get `location_id`
4. `POST /sales/sales-returns/` -> receive return

**Marketplace return:**
1. `GET /sales/returns/items/unprocessed/wms` -> get `salesorder_detail_id`
2. `POST /inventory/items/to-return/` -> accept return (auto-receive)
3. `POST /inventory/items/complete-return/` -> mark as not a return
4. `POST /inventory/items/reject-return/` -> reject return

### Inbound: Consignment Products

1. `GET /contacts/suppliers/` -> get `contact_id`, `contact_name`
2. `GET /locations/` -> get `location_id`
3. `GET /inventory/items/to-buy` -> get item details
4. `POST /purchase/bills/` -> receive consignment

### Outbound: Order Fulfillment (Pick -> Pack -> Ship)

**Picking:**
1. `GET /wms/sales/orders/ready-to-process/` -> get ready orders
2. `POST /wms/sales/ready-to-pick` -> move to pick queue
3. `POST /wms/sales/picklists/` -> create picklist
4. `POST /wms/order/getOrderByNo/` -> get items to pick

**Packing:**
1. `GET /wms/sales/orders/finish-pick/` -> get picked orders
2. `POST /wms/sales/packlist` -> create packlist
3. `POST /wms/sales/packlist/verify-barcode/` -> verify items
4. `POST /wms/sales/packlist/update-qty-packed` -> update qty
5. `POST /wms/sales/packlist/mark-as-complete/` -> mark done

**Shipping:**
1. `POST /wms/shipments/` -> create shipment schedule (regular courier)
2. `POST /wms/shipments/instant-courier/` -> create for instant courier
3. `POST /wms/shipment-detail/` -> add orders to shipment
4. `POST /wms/sales/shipments/orders/` -> get AWB
5. `POST /sales/shipments/` -> mark as received by courier

---

## API Flow

The API Flow tag provides high-level guidance on how to chain endpoints together for common business processes. See the Workflow Guides section above for detailed step-by-step flows.

---

## Data Coverage Statistics

- **Tags documented**: 25/25
- **Paths documented**: 254/254
- **Endpoints documented**: 287/287
- **Schemas documented**: 282/282
- **Parameters captured**: 1023
- **Request bodies captured**: 102
- **Response definitions captured**: 562
- **Schema properties captured**: 2162+
- **Error codes documented**: 40
- **HTTP status codes documented**: 9
- **Webhook events documented**: 9
- **Workflow guides**: 12
