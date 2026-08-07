import { RecordManager } from "./RecordManager";

const money = (v: unknown) => `$${Number(v ?? 0).toLocaleString()}`;

export function ProductsPanel() {
  return (
    <RecordManager
      table="products"
      title="Digital products"
      description="Every template, kit and playbook on the marketplace. Add a file link or upload the asset in the Media Library and paste its link here."
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "slug", label: "Slug", required: true, placeholder: "portfolio-os-starter" },
        {
          key: "category",
          label: "Category",
          kind: "select",
          options: ["Template", "UI Kit", "Playbook", "Course", "Tooling"],
        },
        { key: "price", label: "Price (USD)", kind: "number" },
        { key: "version", label: "Version", placeholder: "1.0.0" },
        { key: "image_url", label: "Cover image link", full: true },
        { key: "file_url", label: "Download file link", full: true },
        { key: "summary", label: "Summary", kind: "textarea", full: true },
        { key: "description", label: "Full description", kind: "textarea", full: true },
        { key: "changelog", label: "Version history", kind: "textarea", full: true },
        { key: "tags", label: "Tags", kind: "tags", full: true },
        { key: "featured", label: "Featured", kind: "bool" },
        { key: "active", label: "Live on site", kind: "bool" },
      ]}
      columns={[
        { key: "name", label: "Product" },
        { key: "category", label: "Category" },
        { key: "price", label: "Price", format: (r) => money(r.price) },
        { key: "version", label: "Version" },
        { key: "downloads_count", label: "Downloads" },
        { key: "active", label: "Live", format: (r) => (r.active ? "Yes" : "No") },
      ]}
      summary={(rows) => [
        { label: "Products", value: String(rows.length) },
        { label: "Live", value: String(rows.filter((r) => r.active).length) },
        { label: "Downloads", value: String(rows.reduce((a, r) => a + Number(r.downloads_count ?? 0), 0)) },
        {
          label: "Catalogue value",
          value: money(rows.reduce((a, r) => a + Number(r.price ?? 0), 0)),
        },
      ]}
    />
  );
}

export function BundlesPanel() {
  return (
    <RecordManager
      table="product_bundles"
      title="Bundle deals"
      description="Group products into a discounted bundle. List the product slugs that are included."
      fields={[
        { key: "name", label: "Bundle name", required: true },
        { key: "slug", label: "Slug", required: true },
        { key: "price", label: "Bundle price (USD)", kind: "number" },
        { key: "discount_label", label: "Discount label", placeholder: "Save 20%" },
        { key: "image_url", label: "Cover image link", full: true },
        { key: "summary", label: "Summary", kind: "textarea", full: true },
        { key: "product_slugs", label: "Included product slugs", kind: "tags", full: true },
        { key: "active", label: "Live on site", kind: "bool" },
      ]}
      columns={[
        { key: "name", label: "Bundle" },
        { key: "price", label: "Price", format: (r) => money(r.price) },
        { key: "discount_label", label: "Discount" },
        {
          key: "product_slugs",
          label: "Includes",
          format: (r) => (Array.isArray(r.product_slugs) ? r.product_slugs.join(", ") : ""),
        },
        { key: "active", label: "Live", format: (r) => (r.active ? "Yes" : "No") },
      ]}
    />
  );
}

export function ReviewsPanel() {
  return (
    <RecordManager
      table="product_reviews"
      title="Customer reviews"
      description="Reviews submitted from the marketplace stay hidden until you approve them."
      fields={[
        { key: "product_slug", label: "Product slug", required: true },
        { key: "author_name", label: "Author" },
        { key: "author_email", label: "Author email" },
        { key: "rating", label: "Rating (1 to 5)", kind: "number" },
        { key: "body", label: "Review", kind: "textarea", full: true },
        { key: "approved", label: "Approved", kind: "bool" },
      ]}
      columns={[
        { key: "product_slug", label: "Product" },
        { key: "author_name", label: "Author" },
        { key: "rating", label: "Rating", format: (r) => "★".repeat(Number(r.rating ?? 0)) },
        { key: "approved", label: "Approved", format: (r) => (r.approved ? "Yes" : "Pending") },
        { key: "body", label: "Review" },
      ]}
      summary={(rows) => [
        { label: "Reviews", value: String(rows.length) },
        { label: "Pending", value: String(rows.filter((r) => !r.approved).length) },
        {
          label: "Average rating",
          value: rows.length
            ? (rows.reduce((a, r) => a + Number(r.rating ?? 0), 0) / rows.length).toFixed(1)
            : "0.0",
        },
      ]}
    />
  );
}

export function LicensesPanel() {
  return (
    <RecordManager
      table="product_licenses"
      title="License keys"
      description="Every key issued by a download claim, plus any key you create by hand. Revoke a key by setting its status."
      fields={[
        { key: "product_slug", label: "Product slug", required: true },
        { key: "license_key", label: "License key", required: true },
        { key: "customer_name", label: "Customer" },
        { key: "customer_email", label: "Customer email" },
        { key: "status", label: "Status", kind: "select", options: ["active", "revoked", "expired"] },
        { key: "activations", label: "Activations", kind: "number" },
        { key: "max_activations", label: "Max activations", kind: "number" },
        { key: "expires_on", label: "Expires on", kind: "date" },
        { key: "notes", label: "Notes", kind: "textarea", full: true },
      ]}
      columns={[
        { key: "license_key", label: "Key" },
        { key: "product_slug", label: "Product" },
        { key: "customer_email", label: "Customer" },
        { key: "status", label: "Status" },
        { key: "activations", label: "Used", format: (r) => `${r.activations ?? 0}/${r.max_activations ?? 0}` },
      ]}
      summary={(rows) => [
        { label: "Keys issued", value: String(rows.length) },
        { label: "Active", value: String(rows.filter((r) => r.status === "active").length) },
        { label: "Revoked", value: String(rows.filter((r) => r.status === "revoked").length) },
      ]}
    />
  );
}
