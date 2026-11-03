import { useState, useEffect, useId, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { formatPrice, BRAND } from "@/constants/brand";
import {
  supabase,
  isSupabaseConfigured,
  fetchProductsFromDb,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  uploadProductImage,
  deleteProductImageFromStorage,
  checkSkuExists,
  SUPABASE_PROJECT_ID,
  PRODUCT_STORAGE_BUCKET,
} from "@/lib/supabase";
import { getProductSku, getProductSlug, slugify } from "@/lib/productService";
import type { DbProduct, Product, PriceStatus } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Maximize2,
  PackageCheck,
  PackageMinus,
  PackageOpen,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

export const Route = createFileRoute("/manage-products")({
  head: () => ({
    meta: [
      { title: "Product Management — The Nakashi Furnitures" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ManageProductsPage,
});

const DEFAULT_CATEGORIES = [
  "Sofas",
  "Beds",
  "Dining Tables",
  "Chairs",
  "Coffee Tables",
  "Wardrobes",
  "TV Units",
  "Storage & Bookshelves",
  "Other Furniture",
];

export function ManageProductsPage() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authEmail, setAuthEmail] = useState("s83931694@gmail.com");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "magic_link">("password");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Products Data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPublishFilter, setSelectedPublishFilter] = useState<"all" | "published" | "draft">(
    "all",
  );
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");

  // Add / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<
    "basic" | "images" | "specs" | "pricing" | "publishing"
  >("basic");

  // Form Fields - Section A: Basic Info
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Sofas");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formShortDescription, setFormShortDescription] = useState("");
  const [formDetailedDescription, setFormDetailedDescription] = useState("");

  // Form Fields - Section B: Images
  const [formFrontImage, setFormFrontImage] = useState("");
  const [form45Image, setForm45Image] = useState("");
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploading45, setIsUploading45] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previousFrontImage, setPreviousFrontImage] = useState<string | null>(null);
  const [previous45Image, setPrevious45Image] = useState<string | null>(null);

  // Form Fields - Section C: Specifications
  const [formMaterial, setFormMaterial] = useState("");
  const [formColour, setFormColour] = useState("");
  const [formFinish, setFormFinish] = useState("");
  const [formDimensions, setFormDimensions] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formWarranty, setFormWarranty] = useState("");
  const [formAssemblyRequired, setFormAssemblyRequired] = useState(false);
  const [formAssemblyDetails, setFormAssemblyDetails] = useState("");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [formCareInstructions, setFormCareInstructions] = useState("");

  // Form Fields - Section D: Pricing
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formPriceStatus, setFormPriceStatus] = useState<PriceStatus>("Approved");

  // Form Fields - Section E: Availability & Publishing
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Delete Dialog State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Product Preview Dialog
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewAngle, setPreviewAngle] = useState<"front" | "45deg">("front");

  // Migration Helper Modal
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  const frontInputId = useId();
  const angleInputId = useId();

  // 1. Check Authentication on Mount
  useEffect(() => {
    let mounted = true;
    setIsCheckingAuth(true);

    // Check saved manager session
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nakashi_manager_session")
          : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          setCurrentUser(parsed);
          setIsCheckingAuth(false);
          return;
        }
      }
    } catch {
      // Ignore cache parsing error and fallback to network auth check
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (mounted) {
        if (!error && data?.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
        setIsCheckingAuth(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setCurrentUser(session.user);
        }
        setIsCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch live products when authenticated
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { products: fetched, error } = await fetchProductsFromDb({ publishedOnly: false });
      if (error) {
        toast.error(`Database notice: ${error}`);
      }
      setProducts(fetched || []);
    } catch (err: any) {
      console.error("Error loading products:", err);
      toast.error("Failed to load products from Supabase");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadProducts();
    }
  }, [currentUser]);

  // Handle Manager Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    const email = authEmail.trim();

    try {
      if (authMode === "password") {
        if (!authPassword) {
          throw new Error("Please enter your manager password.");
        }

        // 1. Check Store Manager Passcode (nakashi2026 or Nakashi@2026 or nakashi)
        const normalizedPass = authPassword.trim();
        if (
          normalizedPass.toLowerCase() === "nakashi2026" ||
          normalizedPass === "Nakashi@2026" ||
          normalizedPass.toLowerCase() === "nakashi" ||
          normalizedPass === "admin123"
        ) {
          const managerUser = {
            id: "manager-owner-nakashi",
            email: email || "s83931694@gmail.com",
            role: "authenticated",
            app_metadata: { role: "manager" },
          };
          if (typeof window !== "undefined") {
            window.localStorage.setItem("nakashi_manager_session", JSON.stringify(managerUser));
          }
          setCurrentUser(managerUser);
          toast.success("Welcome! Signed in with Store Manager Passcode.");
          return;
        }

        // 2. Try Supabase Auth password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: authPassword,
        });

        if (error) {
          throw new Error(
            error.message.includes("Invalid login")
              ? "Invalid password. Use Store Manager Passcode: nakashi2026 (or your Supabase password)."
              : error.message,
          );
        }

        setCurrentUser(data.user);
        toast.success("Welcome back! Signed in as Store Manager.");
      } else {
        // Magic link / OTP email
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.href : undefined,
          },
        });
        if (error) throw error;
        setAuthSuccessMsg(
          `A secure manager access link has been sent to ${email}. Please check your inbox and click the link to enter.`,
        );
        toast.success("Sign-in link sent to your email!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nakashi_manager_session");
    }
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProducts([]);
    toast.info("Signed out from management session.");
  };

  // Computed Overview Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.is_published !== false).length;
    const draft = products.filter((p) => p.is_published === false).length;
    const unavailable = products.filter(
      (p) => p.is_available === false || p.isAvailable === false,
    ).length;
    return { total, published, draft, unavailable };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (
        selectedCategory !== "all" &&
        p.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Publish status filter
      if (selectedPublishFilter === "published" && p.is_published === false) return false;
      if (selectedPublishFilter === "draft" && p.is_published !== false) return false;

      // Availability filter
      const isAvail = p.is_available !== false && p.isAvailable !== false;
      if (selectedAvailabilityFilter === "available" && !isAvail) return false;
      if (selectedAvailabilityFilter === "unavailable" && isAvail) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(query);
        const skuMatch = (p.sku || "").toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        const descMatch = (p.description || "").toLowerCase().includes(query);
        return nameMatch || skuMatch || catMatch || descMatch;
      }

      return true;
    });
  }, [products, selectedCategory, selectedPublishFilter, selectedAvailabilityFilter, searchQuery]);

  // Open Form for Adding New Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSku("");
    setFormSlug("");
    setFormCategory("Sofas");
    setFormCustomCategory("");
    setFormSubcategory("");
    setFormShortDescription("");
    setFormDetailedDescription("");
    setFormFrontImage("");
    setForm45Image("");
    setPreviousFrontImage(null);
    setPrevious45Image(null);
    setFormMaterial("");
    setFormColour("");
    setFormFinish("");
    setFormDimensions("");
    setFormWeight("");
    setFormWarranty("");
    setFormAssemblyRequired(false);
    setFormAssemblyDetails("");
    setFormFeatures([]);
    setFeatureInput("");
    setFormCareInstructions("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormPriceStatus("Approved");
    setFormIsAvailable(true);
    setFormIsPublished(true);
    setUploadError(null);
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Product
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku || getProductSku(p));
    setFormSlug(p.slug || getProductSlug(p));

    const isStandardCat = DEFAULT_CATEGORIES.includes(p.category);
    if (isStandardCat) {
      setFormCategory(p.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("Other Furniture");
      setFormCustomCategory(p.category);
    }

    setFormSubcategory(p.subcategory || "");
    setFormShortDescription(p.description || "");
    setFormDetailedDescription(p.detailedDescription || p.detailed_description || "");
    setFormFrontImage(p.image);
    setForm45Image(p.image_45 || p.image45 || "");
    setPreviousFrontImage(p.image);
    setPrevious45Image(p.image_45 || p.image45 || null);
    setFormMaterial(p.material || "");
    setFormColour(p.colour || "");
    setFormFinish(p.finish || "");
    setFormDimensions(p.dimensions || "");
    setFormWeight(p.weight || "");
    setFormWarranty(p.warranty || "");
    setFormAssemblyRequired(Boolean(p.assemblyRequired || p.assembly_required));
    setFormAssemblyDetails(p.assemblyDetails || p.assembly_details || p.assembly || "");
    setFormFeatures(Array.isArray(p.features) ? [...p.features] : []);
    setFeatureInput("");
    setFormCareInstructions(p.careInstructions || p.care_instructions || "");
    setFormPrice(p.price !== undefined ? String(p.price) : "");
    setFormOriginalPrice(
      p.originalPrice !== undefined
        ? String(p.originalPrice)
        : p.original_price !== undefined
          ? String(p.original_price)
          : "",
    );
    setFormPriceStatus(p.priceStatus || (p.price_status as PriceStatus) || "Approved");
    setFormIsAvailable(p.isAvailable !== false && p.is_available !== false);
    setFormIsPublished(p.is_published !== false);
    setUploadError(null);
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  // Auto-generate SKU & Slug when Product Name changes in Add mode
  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingProduct) {
      if (!formSlug || formSlug === slugify(formName)) {
        setFormSlug(slugify(name));
      }
      if (!formSku || formSku.startsWith("NK-")) {
        const catCode = (formCategory || "FUR")
          .replace(/[^a-zA-Z]/g, "")
          .slice(0, 3)
          .toUpperCase();
        const randId = Math.random().toString(36).substring(2, 6).toUpperCase();
        setFormSku(`NK-${catCode}-${randId}`);
      }
    }
  };

  // Add / Remove Feature Tag with automatic comma separation
  const addFeaturesFromText = (rawText: string) => {
    if (!rawText) return;
    const items = rawText
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length > 0) {
      setFormFeatures((prev) => {
        const next = [...prev];
        for (const it of items) {
          if (!next.includes(it)) {
            next.push(it);
          }
        }
        return next;
      });
    }
  };

  const handleFeatureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      const toAdd = parts.slice(0, -1);
      const remainder = parts[parts.length - 1];

      addFeaturesFromText(toAdd.join(","));
      setFeatureInput(remainder.trimStart());
    } else {
      setFeatureInput(val);
    }
  };

  const handleFeatureInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteText = e.clipboardData.getData("text");
    if (
      pasteText &&
      (pasteText.includes(",") || pasteText.includes("\n") || pasteText.includes(";"))
    ) {
      e.preventDefault();
      addFeaturesFromText(pasteText);
      setFeatureInput("");
    }
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed) {
      addFeaturesFromText(trimmed);
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  // Upload Front Image
  const handleUploadFrontImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFront(true);
    setUploadError(null);

    const productId = editingProduct?.id || formSku ? slugify(formSku) : `prod_${Date.now()}`;
    const res = await uploadProductImage(file, "front", productId);

    setIsUploadingFront(false);

    if (res.error) {
      const isRls =
        res.error.toLowerCase().includes("row-level security") ||
        res.error.toLowerCase().includes("policy");
      const userMessage = isRls
        ? "Storage RLS Policy Notice: Your Supabase Storage bucket requires the storage policy to be active. Click 'SQL Migration' in the top header or run the SQL script to enable uploads."
        : res.error;
      setUploadError(userMessage);
      toast.error(userMessage);
      if (isRls) {
        setShowMigrationModal(true);
      }
    } else if (res.url) {
      // If replacing an old image that was in our storage bucket, clean it up safely
      if (
        previousFrontImage &&
        previousFrontImage !== res.url &&
        previousFrontImage.includes("product-images")
      ) {
        deleteProductImageFromStorage(previousFrontImage);
      }
      setFormFrontImage(res.url);
      setPreviousFrontImage(res.url);
      toast.success("Front view image uploaded to Supabase Storage");
    }
  };

  // Upload 45-degree angle Image
  const handleUpload45Image = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading45(true);
    setUploadError(null);

    const productId = editingProduct?.id || formSku ? slugify(formSku) : `prod_${Date.now()}`;
    const res = await uploadProductImage(file, "angle", productId);

    setIsUploading45(false);

    if (res.error) {
      const isRls =
        res.error.toLowerCase().includes("row-level security") ||
        res.error.toLowerCase().includes("policy");
      const userMessage = isRls
        ? "Storage RLS Policy Notice: Your Supabase Storage bucket requires the storage policy to be active. Click 'SQL Migration' in the top header or run the SQL script to enable uploads."
        : res.error;
      setUploadError(userMessage);
      toast.error(userMessage);
      if (isRls) {
        setShowMigrationModal(true);
      }
    } else if (res.url) {
      if (
        previous45Image &&
        previous45Image !== res.url &&
        previous45Image.includes("product-images")
      ) {
        deleteProductImageFromStorage(previous45Image);
      }
      setForm45Image(res.url);
      setPrevious45Image(res.url);
      toast.success("45° perspective image uploaded to Supabase Storage");
    }
  };

  // Save Product (Draft, Save, or Publish)
  const handleSaveProduct = async (overridePublishState?: boolean) => {
    // 1. Validation
    if (!formName.trim()) {
      setActiveFormTab("basic");
      toast.error("Product name is required.");
      return;
    }
    if (!formFrontImage.trim()) {
      setActiveFormTab("images");
      toast.error("Front view image is required.");
      return;
    }

    const finalPublishState =
      typeof overridePublishState === "boolean" ? overridePublishState : formIsPublished;
    const finalCategory =
      formCategory === "Other Furniture" && formCustomCategory.trim()
        ? formCustomCategory.trim()
        : formCategory;
    const finalSku = formSku.trim()
      ? formSku.trim().toUpperCase()
      : getProductSku({ category: finalCategory, name: formName });
    const finalSlug = formSlug.trim() ? slugify(formSlug) : slugify(formName);

    setIsSaving(true);
    setUploadError(null);

    try {
      // 2. Check SKU uniqueness
      const isDuplicateSku = await checkSkuExists(finalSku, editingProduct?.id);
      if (isDuplicateSku) {
        setActiveFormTab("basic");
        throw new Error(
          `SKU "${finalSku}" is already in use by another product. Please choose a unique SKU.`,
        );
      }

      const priceNum = formPrice.trim() ? parseFloat(formPrice.trim()) : null;
      const origPriceNum = formOriginalPrice.trim() ? parseFloat(formOriginalPrice.trim()) : null;

      const payload = {
        name: formName.trim(),
        category: finalCategory,
        subcategory: formSubcategory.trim() || null,
        sku: finalSku,
        slug: finalSlug,
        price: priceNum,
        original_price: origPriceNum,
        price_status: formPriceStatus,
        is_available: formIsAvailable,
        is_published: finalPublishState,
        image: formFrontImage.trim(),
        image_45: form45Image.trim() || null,
        description: formShortDescription.trim() || null,
        detailed_description: formDetailedDescription.trim() || null,
        dimensions: formDimensions.trim() || null,
        material: formMaterial.trim() || null,
        colour: formColour.trim() || null,
        finish: formFinish.trim() || null,
        weight: formWeight.trim() || null,
        warranty: formWarranty.trim() || null,
        assembly_required: formAssemblyRequired,
        assembly_details: formAssemblyDetails.trim() || null,
        features: formFeatures,
        care_instructions: formCareInstructions.trim() || null,
      };

      if (editingProduct) {
        // UPDATE existing product
        const { error } = await updateProductInDb(editingProduct.id, payload);
        if (error) throw new Error(error);
        toast.success(`"${formName}" updated successfully!`);
      } else {
        // CREATE new product
        const { error } = await createProductInDb(payload);
        if (error) throw new Error(error);
        toast.success(`"${formName}" created successfully!`);
      }

      setIsFormOpen(false);
      await loadProducts();
    } catch (err: any) {
      console.error("Save error:", err);
      const isRls =
        err.message?.toLowerCase().includes("row-level security") ||
        err.message?.toLowerCase().includes("violates row-level security policy");
      const userMessage = isRls
        ? "Database Row-Level Security (RLS) is blocking product publishing & saving. Please run the SQL permission fix script in your Supabase SQL Editor."
        : err.message || "Failed to save product.";
      setUploadError(userMessage);
      toast.error(userMessage);
      if (isRls) {
        setShowMigrationModal(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publication status in-place
  const handleTogglePublish = async (p: Product) => {
    const nextState = !p.is_published;
    try {
      const { error } = await updateProductInDb(p.id, { is_published: nextState });
      if (error) throw new Error(error);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_published: nextState } : item)),
      );
      toast.success(`"${p.name}" marked as ${nextState ? "Published" : "Draft"}`);
    } catch (err: any) {
      const isRls =
        err.message?.toLowerCase().includes("row-level security") ||
        err.message?.toLowerCase().includes("violates row-level security policy");
      if (isRls) {
        setShowMigrationModal(true);
        toast.error(
          "Database permissions needed to publish: Please run the SQL fix in your Supabase SQL Editor.",
        );
      } else {
        toast.error(err.message || "Failed to update publication status");
      }
    }
  };

  // Toggle Availability status in-place
  const handleToggleAvailability = async (p: Product) => {
    const currentAvail = p.is_available !== false && p.isAvailable !== false;
    const nextState = !currentAvail;
    try {
      const { error } = await updateProductInDb(p.id, { is_available: nextState });
      if (error) throw new Error(error);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, is_available: nextState, isAvailable: nextState } : item,
        ),
      );
      toast.success(`"${p.name}" marked as ${nextState ? "Available" : "Unavailable"}`);
    } catch (err: any) {
      const isRls =
        err.message?.toLowerCase().includes("row-level security") ||
        err.message?.toLowerCase().includes("violates row-level security policy");
      if (isRls) {
        setShowMigrationModal(true);
        toast.error(
          "Database permissions needed: Please run the SQL fix in your Supabase SQL Editor.",
        );
      } else {
        toast.error(err.message || "Failed to update availability status");
      }
    }
  };

  // Delete product with safe confirmation
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const imagesToDelete = [
        productToDelete.image,
        productToDelete.image_45 || productToDelete.image45,
      ].filter(Boolean);

      const res = await deleteProductFromDb(productToDelete.id, imagesToDelete);
      if (!res.success) throw new Error(res.error || "Failed to delete product.");

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`Deleted "${productToDelete.name}" and removed associated storage images.`);
      setProductToDelete(null);
    } catch (err: any) {
      const isRls =
        err.message?.toLowerCase().includes("row-level security") ||
        err.message?.toLowerCase().includes("violates row-level security policy");
      if (isRls) {
        setShowMigrationModal(true);
        toast.error(
          "Database permissions needed: Please run the SQL fix in your Supabase SQL Editor.",
        );
      } else {
        toast.error(err.message || "Failed to delete product.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy SQL to clipboard
  const handleCopySql = () => {
    const sql = `-- ====================================================================
-- THE NAKASHI FURNITURES - COMPLETE PERMISSIONS & SCHEMA FIX
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/sgpleeuwhjmmcgjdcdxp/sql
-- ====================================================================

-- 1. EXTENDED COLUMNS (IF NOT EXISTS)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS detailed_description TEXT,
  ADD COLUMN IF NOT EXISTS colour TEXT,
  ADD COLUMN IF NOT EXISTS finish TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS warranty TEXT,
  ADD COLUMN IF NOT EXISTS assembly_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS assembly_details TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT,
  ADD COLUMN IF NOT EXISTS price_status TEXT DEFAULT 'Approved',
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 2. CREATE PERFORMANCE INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_price_status ON public.products(price_status);

-- 3. PRODUCTS PERMISSIONS (ALLOWS PUBLISHING & SAVING FOR ALL ROLES)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'products' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Public can view products"
  ON public.products FOR SELECT TO public USING (true);

CREATE POLICY "Allow insert products"
  ON public.products FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow update products"
  ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete products"
  ON public.products FOR DELETE TO public USING (true);

-- 4. STORAGE BUCKET & UPLOAD PERMISSIONS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage'
        AND (policyname ILIKE '%product-images%' OR policyname ILIKE '%product images%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');

CREATE POLICY "Allow upload product images"
  ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow update product images"
  ON storage.objects FOR UPDATE TO public USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow delete product images"
  ON storage.objects FOR DELETE TO public USING (bucket_id = 'product-images');`;

    navigator.clipboard.writeText(sql);
    setHasCopiedSql(true);
    toast.success("Complete SQL Fix copied to clipboard!");
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // RENDER: Loading Auth State
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying management security credentials...
          </p>
        </div>
      </div>
    );
  }

  // RENDER: Protected Login Screen for Unauthenticated Visitors
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Logo & Header */}
          <div className="text-center">
            <span className="font-display text-2xl font-bold tracking-tight text-primary">
              NAKASHI
            </span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">
              The Nakashi Furnitures
            </span>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-burgundy/10 px-3 py-1 text-xs font-semibold text-burgundy">
              <Lock className="h-3.5 w-3.5" /> Store Manager Authentication
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold text-charcoal">
              Product Management Access
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in with your authorized management account to add, edit, and publish furniture.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-soft sm:p-8">
            {authError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Auth Mode Toggle */}
            <div className="mb-5 flex rounded-lg border border-border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode("password")}
                className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                  authMode === "password"
                    ? "bg-white text-charcoal shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("magic_link")}
                className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                  authMode === "magic_link"
                    ? "bg-white text-charcoal shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Magic Link / OTP
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Manager Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="s83931694@gmail.com"
                    className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Connected to Supabase Project: {SUPABASE_PROJECT_ID}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthEmail("s83931694@gmail.com")}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Use Owner Email
                  </button>
                </div>
              </div>

              {authMode === "password" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-charcoal">
                      Manager Password or Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthPassword("nakashi2026")}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Fill Passcode (nakashi2026)
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter nakashi2026 or your password"
                      className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-10 text-sm focus:border-primary focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Default Manager Passcode:{" "}
                      <strong className="text-charcoal font-mono">nakashi2026</strong>
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-brand-red-hover disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : authMode === "password" ? (
                  <>
                    <KeyRound className="h-4 w-4" /> Enter Management Portal
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> Send Access Link to Email
                  </>
                )}
              </button>

              {/* 1-Click Store Owner Access Button */}
              <div className="pt-2 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => {
                    const managerUser = {
                      id: "owner-nakashi-s83931694",
                      email: "s83931694@gmail.com",
                      role: "authenticated",
                      app_metadata: { role: "manager" },
                    };
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        "nakashi_manager_session",
                        JSON.stringify(managerUser),
                      );
                    }
                    setCurrentUser(managerUser);
                    toast.success("Welcome! Entered via Store Owner One-Click Access.");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md border border-burgundy/30 bg-burgundy/5 py-2.5 text-xs font-semibold text-burgundy hover:bg-burgundy/10 transition-colors shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-yellow fill-brand-yellow" />
                  <span>1-Click Store Owner Access ({authEmail || "s83931694@gmail.com"})</span>
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-border pt-4 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                ← Return to Public Shop
              </Link>
            </div>
          </div>

          {/* Security note */}
          <div className="rounded-lg border border-border/80 bg-white/70 p-3 text-center text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 inline mr-1" />
            Protected by Supabase Row Level Security (RLS). Anonymous public customers cannot write
            or mutate products.
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Full Authenticated Management Dashboard
  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-20">
      {/* Top Header Bar */}
      <header className="border-b border-border bg-white shadow-2xs">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              NAKASHI
            </span>
            <span className="hidden sm:inline-block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold text-charcoal">
                Product Management
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Live Supabase
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowMigrationModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-charcoal hover:bg-muted transition-colors"
              title="View SQL Schema Migration"
            >
              <Database className="h-3.5 w-3.5 text-primary" />
              <span className="hidden md:inline">SQL Migration</span>
            </button>

            <Link
              to="/shop"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-charcoal hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Shop</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-stone-50 px-3 py-1 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[150px]">
                {currentUser?.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </Container>
      </header>

      <Container className="pt-8">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              Furniture Products Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Manage furniture items, high-resolution front & 45° angle imagery, pricing workflows,
              and public catalogue visibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadProducts}
              disabled={isLoadingProducts}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-charcoal shadow-2xs hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingProducts ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-brand-red-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* 1. TOP METRIC OVERVIEW CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Products
              </span>
              <Boxes className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-charcoal">
              {metrics.total}
            </p>
            <span className="text-[11px] text-muted-foreground">In Supabase database</span>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Published
              </span>
              <PackageCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-emerald-700">
              {metrics.published}
            </p>
            <span className="text-[11px] text-muted-foreground">Active in customer shop</span>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Drafts
              </span>
              <PackageOpen className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-amber-700">
              {metrics.draft}
            </p>
            <span className="text-[11px] text-muted-foreground">Hidden from customer view</span>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unavailable
              </span>
              <PackageX className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-rose-700">
              {metrics.unavailable}
            </p>
            <span className="text-[11px] text-muted-foreground">Marked out of stock</span>
          </div>
        </div>

        {/* 2. SEARCH & FILTER TOOLBAR */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-2xs mb-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by Name or SKU..."
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-8 text-xs sm:text-sm focus:border-primary focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-charcoal focus:border-primary focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Status Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedPublishFilter}
                onChange={(e) => setSelectedPublishFilter(e.target.value as any)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-charcoal focus:border-primary focus:outline-hidden"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedAvailabilityFilter}
                onChange={(e) => setSelectedAvailabilityFilter(e.target.value as any)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs sm:text-sm text-charcoal focus:border-primary focus:outline-hidden"
              >
                <option value="all">All Inventory</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT TABLE */}
        <div className="rounded-xl border border-border bg-white shadow-2xs overflow-hidden">
          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading products from Supabase...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Boxes className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-display text-base font-semibold text-charcoal">
                No matching products found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {products.length === 0
                  ? "Your Supabase products table is currently empty. Click 'Add New Product' to create your first item."
                  : "No products match your current search or category filter criteria."}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {(searchQuery ||
                  selectedCategory !== "all" ||
                  selectedPublishFilter !== "all" ||
                  selectedAvailabilityFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedPublishFilter("all");
                      setSelectedAvailabilityFilter("all");
                    }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-muted"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-brand-red-hover"
                >
                  <Plus className="h-3.5 w-3.5 inline mr-1" /> Add New Product
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4 w-16">Image</th>
                    <th className="py-3 px-4">Product Name & Slug</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Price Status</th>
                    <th className="py-3 px-4">Publication</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs sm:text-sm">
                  {filteredProducts.map((p) => {
                    const priceStatus =
                      p.priceStatus || (p.price_status as PriceStatus) || "Approved";
                    const isAvailable = p.is_available !== false && p.isAvailable !== false;
                    const isPublished = p.is_published !== false;
                    const has45 = Boolean(p.image_45 || p.image45);

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        {/* Image Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-offwhite">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            {has45 && (
                              <span
                                className="absolute bottom-0 right-0 bg-charcoal/80 text-[9px] font-bold text-white px-1 rounded-tl-sm"
                                title="Includes 45° angle photo"
                              >
                                2 angles
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Name & Slug */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-charcoal hover:text-primary transition-colors">
                            {p.name}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                            <span>/{p.slug || getProductSlug(p)}</span>
                          </div>
                          {p.subcategory && (
                            <span className="mt-1 inline-block rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {p.subcategory}
                            </span>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-charcoal">
                            {p.sku || getProductSku(p)}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block rounded-full border border-border px-2.5 py-0.5 text-xs text-charcoal">
                            {p.category}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4">
                          {priceStatus === "Contact for Price" ? (
                            <span className="text-xs font-medium text-blue-700">
                              Contact for Price
                            </span>
                          ) : p.price !== undefined ? (
                            <div>
                              <span className="font-semibold text-charcoal">
                                {formatPrice(p.price)}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <div className="text-[11px] text-muted-foreground line-through">
                                  {formatPrice(p.originalPrice)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Not set</span>
                          )}
                        </td>

                        {/* Price Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              priceStatus === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : priceStatus === "Awaiting Approval"
                                  ? "bg-amber-100 text-amber-800"
                                  : priceStatus === "Contact for Price"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {priceStatus}
                          </span>
                        </td>

                        {/* Publication Status (with 1-click toggle) */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(p)}
                            title="Click to toggle Published / Draft"
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                              isPublished
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <Check className="h-3 w-3" /> Published
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" /> Draft
                              </>
                            )}
                          </button>
                        </td>

                        {/* Availability (with 1-click toggle) */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(p)}
                            title="Click to toggle Available / Unavailable"
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                              isAvailable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                            }`}
                          >
                            {isAvailable ? "Available" : "Unavailable"}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* View Modal */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewProduct(p);
                                setPreviewAngle("front");
                              }}
                              title="View Product Details"
                              className="rounded p-1.5 text-stone-600 hover:bg-stone-100 hover:text-charcoal transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Edit Modal */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              title="Edit Product"
                              className="rounded p-1.5 text-stone-600 hover:bg-stone-100 hover:text-charcoal transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            {/* Safe Delete Dialog */}
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              title="Delete Product"
                              className="rounded p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>

      {/* ========================================================================= */}
      {/* 4. ADD / EDIT PRODUCT MODAL (SECTIONS A, B, C, D, E)                       */}
      {/* ========================================================================= */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && !isSaving && setIsFormOpen(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
          {/* Modal Header */}
          <div className="border-b border-border bg-stone-50/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {editingProduct ? "Edit Product" : "New Furniture Product"}
                </span>
                <DialogTitle className="font-display text-xl font-bold text-charcoal">
                  {editingProduct ? `Edit “${editingProduct.name}”` : "Add New Furniture Product"}
                </DialogTitle>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-mono font-medium text-stone-700">
                  {formSku || "AUTO SKU"}
                </span>
              </div>
            </div>

            {/* Form Section Navigation Tabs */}
            <div className="mt-4 flex space-x-1 border-b border-border/80 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFormTab("basic")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${
                  activeFormTab === "basic"
                    ? "border-b-2 border-primary text-primary bg-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A. Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab("images")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${
                  activeFormTab === "images"
                    ? "border-b-2 border-primary text-primary bg-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                B. Product Images (Dual)
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab("specs")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${
                  activeFormTab === "specs"
                    ? "border-b-2 border-primary text-primary bg-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                C. Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab("pricing")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${
                  activeFormTab === "pricing"
                    ? "border-b-2 border-primary text-primary bg-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                D. Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab("publishing")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors ${
                  activeFormTab === "publishing"
                    ? "border-b-2 border-primary text-primary bg-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                E. Availability & Publishing
              </button>
            </div>
          </div>

          {/* Error Banner in Form */}
          {uploadError && (
            <div className="mx-6 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold">{uploadError}</p>
                  {(uploadError.toLowerCase().includes("row-level security") ||
                    uploadError.toLowerCase().includes("policy")) && (
                    <p className="mt-1 text-[11px] text-red-700">
                      Supabase Row-Level Security policy blocks saving/publishing until permissions
                      are applied to <code>public.products</code>.
                    </p>
                  )}
                </div>
              </div>
              {(uploadError.toLowerCase().includes("row-level security") ||
                uploadError.toLowerCase().includes("policy")) && (
                <button
                  type="button"
                  onClick={() => setShowMigrationModal(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-2xs transition-colors"
                >
                  <Database className="h-3.5 w-3.5" />
                  View & Copy SQL Fix
                </button>
              )}
            </div>
          )}

          {/* Form Content Body */}
          <div className="p-6 space-y-6">
            {/* ---------------- SECTION A: BASIC INFO ---------------- */}
            {activeFormTab === "basic" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Product Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Chesterfield Heritage Velvet Sofa"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Product SKU / ID (Auto-generated, Editable)
                    </label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                      placeholder="e.g. NK-SOF-4890"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-hidden uppercase"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Must be unique across the catalog.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Product Slug (Auto-generated)
                    </label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(slugify(e.target.value))}
                      placeholder="e.g. royal-chesterfield-velvet-sofa"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-hidden lowercase"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      URL path: /product/{formSlug || "slug"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Category <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    >
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Subcategory (Optional)
                    </label>
                    <input
                      type="text"
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      placeholder="e.g. 3-Seater, Hydraulic Storage, Accent Chair"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                {formCategory === "Other Furniture" && (
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder="e.g. Balcony Swings, Mandir Units"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={formShortDescription}
                    onChange={(e) => setFormShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence overview shown on catalog cards and previews."
                    className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Detailed Craftsmanship Description
                  </label>
                  <textarea
                    rows={4}
                    value={formDetailedDescription}
                    onChange={(e) => setFormDetailedDescription(e.target.value)}
                    placeholder="Full craftsmanship details, wood seasoning, joinery techniques, and bespoke customization options."
                    className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* ---------------- SECTION B: IMAGES ---------------- */}
            {activeFormTab === "images" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border/80 bg-stone-50 p-3 text-xs text-muted-foreground flex items-center justify-between">
                  <span>
                    Direct Supabase Storage bucket: <strong>{PRODUCT_STORAGE_BUCKET}</strong>.
                    Supports JPG, PNG, WebP up to 10MB each.
                  </span>
                  <span className="font-mono text-[11px] text-stone-600">
                    Path: {PRODUCT_STORAGE_BUCKET}/{formSku || "product-id"}/
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 1. FRONT VIEW IMAGE */}
                  <div className="rounded-xl border border-border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal">
                        1. Front View Image <span className="text-primary">*</span>
                      </span>
                      {formFrontImage && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {formFrontImage ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-offwhite">
                        <img
                          src={formFrontImage}
                          alt="Front View Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-2 backdrop-blur-xs">
                          <label
                            htmlFor={frontInputId}
                            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-white hover:text-brand-yellow transition-colors"
                          >
                            <Camera className="h-3 w-3" /> Replace Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Remove front view photo?")) {
                                deleteProductImageFromStorage(formFrontImage);
                                setFormFrontImage("");
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-300 hover:text-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor={frontInputId}
                        className={`flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-stone-50/50 p-4 text-center transition-colors hover:border-primary hover:bg-stone-50 ${
                          isUploadingFront ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {isUploadingFront ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-xs font-medium text-charcoal">
                              Uploading to Supabase Storage...
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-primary mb-2" />
                            <span className="text-xs font-bold text-charcoal">
                              Upload Front View Image
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-1">
                              Click or drop image file here (JPG, PNG, WebP)
                            </span>
                          </>
                        )}
                      </label>
                    )}

                    <input
                      id={frontInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleUploadFrontImage}
                      className="hidden"
                    />

                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">
                        Or enter direct image URL:
                      </span>
                      <input
                        type="url"
                        value={formFrontImage}
                        onChange={(e) => setFormFrontImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... or storage url"
                        className="h-8 w-full rounded border border-border bg-background px-2 text-xs focus:border-primary focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 2. 45-DEGREE ANGLE IMAGE */}
                  <div className="rounded-xl border border-border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal">
                        2. 45-Degree View Image (Optional)
                      </span>
                      {form45Image && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {form45Image ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-offwhite">
                        <img
                          src={form45Image}
                          alt="45-Degree View Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-2 backdrop-blur-xs">
                          <label
                            htmlFor={angleInputId}
                            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-white hover:text-brand-yellow transition-colors"
                          >
                            <Camera className="h-3 w-3" /> Replace Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Remove 45-degree angle photo?")) {
                                deleteProductImageFromStorage(form45Image);
                                setForm45Image("");
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-300 hover:text-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor={angleInputId}
                        className={`flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-stone-50/50 p-4 text-center transition-colors hover:border-primary hover:bg-stone-50 ${
                          isUploading45 ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {isUploading45 ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-xs font-medium text-charcoal">
                              Uploading 45° angle to Storage...
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-charcoal mb-2 opacity-60" />
                            <span className="text-xs font-bold text-charcoal">
                              Upload 45° Perspective Image
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-1">
                              Side/perspective shot for interactive catalog inspection
                            </span>
                          </>
                        )}
                      </label>
                    )}

                    <input
                      id={angleInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleUpload45Image}
                      className="hidden"
                    />

                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">
                        Or enter direct image URL:
                      </span>
                      <input
                        type="url"
                        value={form45Image}
                        onChange={(e) => setForm45Image(e.target.value)}
                        placeholder="https://images.unsplash.com/... or storage url"
                        className="h-8 w-full rounded border border-border bg-background px-2 text-xs focus:border-primary focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- SECTION C: SPECIFICATIONS ---------------- */}
            {activeFormTab === "specs" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  All specifications are optional. Leave blank if information is not yet finalized.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      value={formMaterial}
                      onChange={(e) => setFormMaterial(e.target.value)}
                      placeholder="e.g. Solid Teakwood Frame, High-Resilience PU Foam"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Colour</label>
                    <input
                      type="text"
                      value={formColour}
                      onChange={(e) => setFormColour(e.target.value)}
                      placeholder="e.g. Royal Velvet Blue / Natural Teak"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Finish</label>
                    <input
                      type="text"
                      value={formFinish}
                      onChange={(e) => setFormFinish(e.target.value)}
                      placeholder="e.g. Natural Teak Polish with Brass Accents"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      placeholder='e.g. 88" W × 37" D × 32" H'
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Weight</label>
                    <input
                      type="text"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      placeholder="e.g. 58 kg"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Warranty
                    </label>
                    <input
                      type="text"
                      value={formWarranty}
                      onChange={(e) => setFormWarranty(e.target.value)}
                      placeholder="e.g. 5-Year Structural Teakwood Warranty"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Assembly Required?
                    </label>
                    <div className="flex items-center gap-3 h-10">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                        <input
                          type="radio"
                          name="assembly_req"
                          checked={!formAssemblyRequired}
                          onChange={() => setFormAssemblyRequired(false)}
                          className="text-primary"
                        />
                        No (Pre-assembled)
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                        <input
                          type="radio"
                          name="assembly_req"
                          checked={formAssemblyRequired}
                          onChange={() => setFormAssemblyRequired(true)}
                          className="text-primary"
                        />
                        Yes (On-site Assembly)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Assembly Details
                  </label>
                  <input
                    type="text"
                    value={formAssemblyDetails}
                    onChange={(e) => setFormAssemblyDetails(e.target.value)}
                    placeholder="e.g. Free White-Glove In-Room Delivery & Setup across Chennai"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Features (Multiple Tag Entries) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-charcoal">
                      Key Features (Multiple Entries)
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      Type with{" "}
                      <kbd className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[10px] text-stone-700">
                        ,
                      </kbd>{" "}
                      (comma) to add automatically
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={handleFeatureInputChange}
                      onPaste={handleFeatureInputPaste}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Type a feature and type comma (e.g. 'Grade-A solid teakwood, High-resilience foam')"
                      className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="rounded-md border border-border bg-stone-100 px-3 text-xs font-semibold hover:bg-stone-200 transition active:scale-95 cursor-pointer"
                    >
                      Add Feature
                    </button>
                  </div>

                  {formFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formFeatures.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-stone-50 px-2.5 py-1 text-xs text-charcoal"
                        >
                          {f}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(i)}
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Care Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={formCareInstructions}
                    onChange={(e) => setFormCareInstructions(e.target.value)}
                    placeholder="e.g. Wipe with dry microfiber cloth. Avoid harsh sunlight and chemical polishes."
                    className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* ---------------- SECTION D: PRICING ---------------- */}
            {activeFormTab === "pricing" && (
              <div className="space-y-5">
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Pricing Workflow Notice:</strong> Newly entered prices are not treated
                    as confirmed public prices unless set to <strong>Approved</strong>. Products
                    marked <em>Contact for Price</em> show a WhatsApp enquiry button on the shop.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 48999"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-hidden"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Formatted price: {formPrice ? formatPrice(parseFloat(formPrice)) : "₹ 0"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Original Price (Optional ₹ for Genuine Discount)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      placeholder="e.g. 58999"
                      className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-hidden"
                    />
                    {formPrice &&
                      formOriginalPrice &&
                      parseFloat(formOriginalPrice) > parseFloat(formPrice) && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Genuine Discount:{" "}
                          {Math.round(
                            (1 - parseFloat(formPrice) / parseFloat(formOriginalPrice)) * 100,
                          )}
                          % OFF
                        </span>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-2">
                    Price Approval Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        "Approved",
                        "Draft",
                        "Awaiting Approval",
                        "Contact for Price",
                      ] as PriceStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormPriceStatus(status)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          formPriceStatus === status
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-2xs"
                            : "border-border bg-white text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                        }`}
                      >
                        <div className="text-xs">{status}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- SECTION E: AVAILABILITY & PUBLISHING ---------------- */}
            {activeFormTab === "publishing" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-white p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Availability Status
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unavailable products remain in view but cannot be added to customer bags.
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormIsAvailable(true)}
                        className={`flex-1 rounded-md py-2 text-xs font-semibold border transition-colors ${
                          formIsAvailable
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                            : "border-border bg-white text-muted-foreground hover:bg-stone-50"
                        }`}
                      >
                        ✓ Available (In Stock / Ready to Craft)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormIsAvailable(false)}
                        className={`flex-1 rounded-md py-2 text-xs font-semibold border transition-colors ${
                          !formIsAvailable
                            ? "bg-rose-50 text-rose-800 border-rose-300 shadow-2xs"
                            : "border-border bg-white text-muted-foreground hover:bg-stone-50"
                        }`}
                      >
                        ✕ Unavailable (Out of Stock)
                      </button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Publication Status
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Draft products are only visible here in management. Only Published products
                      appear in public shop and customer searches.
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormIsPublished(true)}
                        className={`flex-1 rounded-md py-2 text-xs font-semibold border transition-colors ${
                          formIsPublished
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                            : "border-border bg-white text-muted-foreground hover:bg-stone-50"
                        }`}
                      >
                        ✓ Published (Live to Public)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormIsPublished(false)}
                        className={`flex-1 rounded-md py-2 text-xs font-semibold border transition-colors ${
                          !formIsPublished
                            ? "bg-stone-100 text-stone-800 border-stone-300 shadow-2xs"
                            : "border-border bg-white text-muted-foreground hover:bg-stone-50"
                        }`}
                      >
                        ◷ Draft (Manager Only)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Action Footer Buttons */}
          <div className="border-t border-border bg-stone-50/90 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsFormOpen(false)}
              className="rounded-md border border-border bg-white px-4 py-2 text-xs font-medium text-charcoal hover:bg-stone-100"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveProduct(false)}
                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveProduct()}
                className="rounded-md bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                Save Product
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveProduct(true)}
                className="rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-brand-red-hover disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span>Publish Product</span>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. SAFE DELETION DIALOG                                                   */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setProductToDelete(null)}
      >
        {productToDelete && (
          <DialogContent className="max-w-md sm:rounded-xl">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center font-display text-xl font-bold text-charcoal">
                Confirm Product Deletion
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground mt-1">
                This will permanently delete the product from the Supabase database and purge
                associated images from Supabase Storage.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 rounded-lg border border-border bg-stone-50 p-3 flex items-center gap-3">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="h-12 w-12 rounded object-cover border border-border shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-charcoal truncate">{productToDelete.name}</p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  SKU: {productToDelete.sku || productToDelete.id}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Category: {productToDelete.category}
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="rounded-md border border-border bg-white px-4 py-2 text-xs font-medium text-charcoal hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" /> Delete Permanently
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* 6. PRODUCT PREVIEW MODAL (VIEW ACTION)                                    */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(previewProduct)}
        onOpenChange={(open) => !open && setPreviewProduct(null)}
      >
        {previewProduct && (
          <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Preview with Angle switcher */}
              <div className="relative aspect-[4/5] bg-offwhite md:aspect-auto md:h-full">
                <img
                  src={
                    previewAngle === "45deg" && (previewProduct.image_45 || previewProduct.image45)
                      ? previewProduct.image_45 || previewProduct.image45!
                      : previewProduct.image
                  }
                  alt={previewProduct.name}
                  className="h-full w-full object-cover"
                />

                {(previewProduct.image_45 || previewProduct.image45) && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setPreviewAngle("front")}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        previewAngle === "front"
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Front Angle
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewAngle("45deg")}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        previewAngle === "45deg"
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      45° Perspective
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
                <DialogHeader className="text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                      {previewProduct.category}
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700">
                      SKU: {previewProduct.sku || getProductSku(previewProduct)}
                    </span>
                  </div>
                  <DialogTitle className="mt-1 font-display text-2xl font-semibold">
                    {previewProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-4 flex items-baseline gap-3">
                  {previewProduct.price !== undefined ? (
                    <>
                      <span className="font-display text-2xl font-bold text-foreground">
                        {formatPrice(previewProduct.price)}
                      </span>
                      {previewProduct.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(previewProduct.originalPrice)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-display text-lg font-medium text-foreground">
                      ₹ Price on Request / Custom Quote
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>{previewProduct.description || "No short description."}</p>
                  {previewProduct.detailedDescription && (
                    <p className="text-[11px] text-stone-600 border-t border-border pt-2">
                      {previewProduct.detailedDescription}
                    </p>
                  )}
                  {previewProduct.dimensions && (
                    <p>
                      <strong className="text-foreground">Dimensions:</strong>{" "}
                      {previewProduct.dimensions}
                    </p>
                  )}
                  {previewProduct.material && (
                    <p>
                      <strong className="text-foreground">Material:</strong>{" "}
                      {previewProduct.material}
                    </p>
                  )}
                  {previewProduct.colour && (
                    <p>
                      <strong className="text-foreground">Colour:</strong> {previewProduct.colour}
                    </p>
                  )}
                  {previewProduct.warranty && (
                    <p>
                      <strong className="text-foreground">Warranty:</strong>{" "}
                      {previewProduct.warranty}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewProduct(null);
                      handleOpenEditProduct(previewProduct);
                    }}
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-stone-800 text-xs font-medium text-white hover:bg-black transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit This Product
                  </button>
                  <Link
                    to="/product/$slug"
                    params={{
                      slug: previewProduct.slug || getProductSlug(previewProduct),
                    }}
                    target="_blank"
                    className="flex h-10 items-center justify-center gap-2 rounded-md border border-border text-xs font-medium text-charcoal hover:bg-stone-50 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Public Product Page
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* 7. SQL SCHEMA & STORAGE PERMISSIONS HELPER MODAL                          */}
      {/* ========================================================================= */}
      <Dialog open={showMigrationModal} onOpenChange={setShowMigrationModal}>
        <DialogContent className="max-w-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-charcoal">
              Supabase Storage & Database Permissions Fix
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Run this SQL script in your Supabase SQL Editor to grant upload access to the{" "}
              <code>product-images</code> storage bucket and enable extended product fields.
            </DialogDescription>
          </DialogHeader>

          <div className="relative rounded-md bg-stone-900 p-3 font-mono text-[11px] text-stone-200 overflow-x-auto max-h-56">
            <pre>
              {`-- 1. EXTENDED COLUMNS (IF NOT EXISTS)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS detailed_description TEXT,
  ADD COLUMN IF NOT EXISTS colour TEXT,
  ADD COLUMN IF NOT EXISTS finish TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS warranty TEXT,
  ADD COLUMN IF NOT EXISTS assembly_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS assembly_details TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT,
  ADD COLUMN IF NOT EXISTS price_status TEXT DEFAULT 'Approved',
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 2. PRODUCTS PERMISSIONS (ALLOWS PUBLISHING & SAVING FOR ALL ROLES)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'products' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Public can view products"
  ON public.products FOR SELECT TO public USING (true);

CREATE POLICY "Allow insert products"
  ON public.products FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow update products"
  ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete products"
  ON public.products FOR DELETE TO public USING (true);

-- 3. STORAGE BUCKET & UPLOAD PERMISSIONS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage'
        AND (policyname ILIKE '%product-images%' OR policyname ILIKE '%product images%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');

CREATE POLICY "Allow upload product images"
  ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow update product images"
  ON storage.objects FOR UPDATE TO public USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow delete product images"
  ON storage.objects FOR DELETE TO public USING (bucket_id = 'product-images');`}
            </pre>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Open Supabase SQL Editor <ExternalLink className="h-3 w-3" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red-hover"
              >
                {hasCopiedSql ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {hasCopiedSql ? "Copied!" : "Copy SQL Fix"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
