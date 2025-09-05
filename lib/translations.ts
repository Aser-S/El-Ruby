export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    customers: "Customers",
    products: "Products",
    orders: "Orders",
    inventory: "Inventory",
    logout: "Logout",
    back: "Back",

    // POS Interface
    newOrder: "New Order",
    selectCustomer: "Select Customer",
    walkInCustomer: "Walk-in Customer",
    createNewCustomer: "Create New Customer",
    customerName: "Customer Name",
    customerEmail: "Customer Email",
    customerPhone: "Customer Phone",
    save: "Save",
    cancel: "Cancel",

    // Products
    searchProducts: "Search products...",
    addToCart: "Add to Cart",
    quantity: "Quantity",
    price: "Price",
    total: "Total",

    // Payment
    paymentMethod: "Payment Method",
    cash: "Cash",
    customerBalance: "Customer Balance",
    partial: "Partial Payment",
    amountPaid: "Amount Paid",
    remainingBalance: "Remaining Balance",

    // Order
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    createOrder: "Create Order",
    processing: "Processing...",

    // Messages
    itemAdded: "Item added to cart",
    orderCreated: "Order created successfully",
    error: "An error occurred",

    // Currency
    currency: "EGP",
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    customers: "العملاء",
    products: "المنتجات",
    orders: "الطلبات",
    inventory: "المخزون",
    logout: "تسجيل الخروج",
    back: "رجوع",

    // POS Interface
    newOrder: "طلب جديد",
    selectCustomer: "اختر العميل",
    walkInCustomer: "عميل عادي",
    createNewCustomer: "إنشاء عميل جديد",
    customerName: "اسم العميل",
    customerEmail: "البريد الإلكتروني",
    customerPhone: "رقم الهاتف",
    save: "حفظ",
    cancel: "إلغاء",

    // Products
    searchProducts: "البحث عن المنتجات...",
    addToCart: "إضافة للسلة",
    quantity: "الكمية",
    price: "السعر",
    total: "الإجمالي",

    // Payment
    paymentMethod: "طريقة الدفع",
    cash: "نقدي",
    customerBalance: "رصيد العميل",
    partial: "دفع جزئي",
    amountPaid: "المبلغ المدفوع",
    remainingBalance: "الرصيد المتبقي",

    // Order
    orderSummary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    createOrder: "إنشاء الطلب",
    processing: "جاري المعالجة...",

    // Messages
    itemAdded: "تم إضافة العنصر للسلة",
    orderCreated: "تم إنشاء الطلب بنجاح",
    error: "حدث خطأ",

    // Currency
    currency: "ج.م",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
