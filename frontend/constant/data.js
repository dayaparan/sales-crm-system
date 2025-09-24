export const menuItems = [
  {
    title: "Dashboard",
    icon: "material-symbols:dashboard-rounded",
    link: "/dashboard",
    permission: [],
  },
  {
    title: "User Management",
    icon: "heroicons:users",
    link: "/dashboard/account",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Branch",
    icon: "jam:branch-f",
    link: "/dashboard/branch",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Territory",
    icon: "ic:outline-terrain",
    link: "/dashboard/territory",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Project",
    icon: "eos-icons:project-outlined",
    link: "/dashboard/project",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Unit Types",
    icon: "formkit:unit",
    link: "/dashboard/unittype",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Sales Model",
    icon: "icon-park-outline:sales-report",
    link: "/dashboard/salesmodel",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Inquiry Form",
    icon: "mdi:form-outline",
    link: "/dashboard/inquiry-form",
    allowedRoles: ["ADMIN", "MANAGER", "AGENT"],
  },
  {
    title: "Payment Plans",
    icon: "clarity:employee-line",
    link: "/dashboard/paymentplan",
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Lead",
    icon: "tdesign:leaderboard",
    link: "/dashboard/lead",
    allowedRoles: ["ADMIN", "MANAGER", "AGENT"],
  },
  {
    title: "Settings",
    icon: "uil:setting",
    link: "/dashboard/settings",
  },
];

export const topMenu = [];

export const notifications = [];

export const message = [];

export const colors = {
  primary: "#4669FA",
  secondary: "#A0AEC0",
  danger: "#F1595C",
  black: "#111112",
  warning: "#FA916B",
  info: "#0CE7FA",
  light: "#425466",
  success: "#50C793",
  "gray-f7": "#F7F8FC",
  dark: "#1E293B",
  "dark-gray": "#0F172A",
  gray: "#68768A",
  gray2: "#EEF1F9",
  "dark-light": "#CBD5E1",
};

export const hexToRGB = (hex, alpha) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};

export const topFilterLists = [];

export const bottomFilterLists = [];

export const meets = [];

export const files = [];

export const userTypes = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const booleanishOptions = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
];

export const accountRoles = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Sales Manager" },
  { value: "AGENT", label: "Sales Agents" },
];

export const leadSourceOptions = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "EXPO", label: "Expo" },
  { value: "COLD_CALL", label: "Cold Call" },
  { value: "CAMPAIGN_XYZ", label: "Campaign XYZ" },
];

export const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "NURTURING", label: "Nurturing" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
];

export const priorityOptions = [
  { value: "COLD", label: "Cold" },
  { value: "WARM", label: "Warm" },
  { value: "HOT", label: "Hot" },
];

export const preferredChannelOptions = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
  { value: "CALL", label: "Call" },
  { value: "SMS", label: "Sms" },
];

export const timeframeOptions = [
  { value: "IMMEDIATE", label: "Immediate" },
  { value: "ONE_MONTH", label: "One Month" },
  { value: "THREE_MONTHS", label: "Three Month" },
  { value: "SIX_MONTHS", label: "Six Month" },
];

export const budgetRangeOptions = [
  { value: "RANGE_45_60L", label: "45-60 Lakhs" },
  { value: "RANGE_60_80L", label: "60-80 Lakhs" },
  { value: "RANGE_11_15L", label: "11-15 Lakhs" },
  { value: "RANGE_15_25L", label: "15-25 Lakhs" },
  { value: "RANGE_25_35L", label: "25-35 Lakhs" },
  { value: "RANGE_35L_PLUS", label: "35 Lakhs Plus" },
  { value: "RANGE_80L_1CR", label: "80 Lakhs - 1 Crore" },
  { value: "RANGE_1CR_PLUS", label: "1 Crore Plus" },
];

export const purposeOptions = [
  { value: "ROI_RETURNS", label: "ROI Returns" },
  { value: "VACATION_HOME", label: "Vacation Home" },
  { value: "RETIREMENT", label: "Retirement" },
  { value: "CAPITAL_APPRECIATION", label: "Capital Appreciation" },
  { value: "RENTAL_INCOME", label: "Rental Income" },
];

export const investmentModels = [
  { value: "FINEACRES", label: "FINEACRES" },
  { value: "PROPTYO", label: "PROPTYO" },
];

export const occupationOptions = [
  { value: "SALARIED", label: "Salaried" },
  { value: "BUSINESS", label: "business" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "RETIRED", label: "Retired" },
  { value: "OTHER", label: "Other" },
];

export const timezones = [
  { label: "Midway Island, Samoa (UTC-11:00)", value: "Pacific/Midway" },
  { label: "Hawaii (UTC-10:00)", value: "Pacific/Honolulu" },
  { label: "Alaska (UTC-8:00)", value: "America/Anchorage" },
  { label: "Dawson, Yukon (UTC-7:00)", value: "America/Dawson" },
  { label: "Arizona (UTC-7:00)", value: "America/Phoenix" },
  { label: "Tijuana (UTC-7:00)", value: "America/Tijuana" },
  { label: "Pacific Time (UTC-7:00)", value: "America/Los_Angeles" },
  { label: "Mountain Time (UTC-6:00)", value: "America/Denver" },
  { label: "Chihuahua, La Paz, Mazatlan (UTC-6:00)", value: "America/Mazatlan" },
  { label: "Saskatchewan (UTC-6:00)", value: "America/Regina" },
  { label: "Guadalajara, Mexico City, Monterrey (UTC-6:00)", value: "America/Mexico_City" },
  { label: "Central America (UTC-6:00)", value: "America/Guatemala" },
  { label: "Central Time (UTC-5:00)", value: "America/Chicago" },
  { label: "Bogota, Lima, Quito (UTC-5:00)", value: "America/Bogota" },
  { label: "Eastern Time (UTC-4:00)", value: "America/New_York" },
  { label: "Caracas, La Paz (UTC-4:00)", value: "America/Caracas" },
  { label: "Santiago (UTC-4:00)", value: "America/Santiago" },
  { label: "Brasilia (UTC-3:00)", value: "America/Sao_Paulo" },
  { label: "Montevideo (UTC-3:00)", value: "America/Montevideo" },
  { label: "Buenos Aires, Georgetown (UTC-3:00)", value: "America/Argentina/Buenos_Aires" },
  { label: "Newfoundland and Labrador (UTC-2:30)", value: "America/St_Johns" },
  { label: "Greenland (UTC-2:00)", value: "America/Godthab" },
  { label: "Cape Verde Islands (UTC-1:00)", value: "Atlantic/Cape_Verde" },
  { label: "Azores (UTC+0:00)", value: "Atlantic/Azores" },
  { label: "UTC (UTC+0:00)", value: "UTC" },
  { label: "Edinburgh, London (UTC+1:00)", value: "Europe/London" },
  { label: "Dublin (UTC+1:00)", value: "Europe/Dublin" },
  { label: "Lisbon (UTC+1:00)", value: "Europe/Lisbon" },
  { label: "Casablanca, Monrovia (UTC+1:00)", value: "Africa/Casablanca" },
  { label: "Canary Islands (UTC+1:00)", value: "Atlantic/Canary" },
  { label: "West Central Africa (UTC+1:00)", value: "Africa/Lagos" },
  { label: "Belgrade, Bratislava, Budapest, Ljubljana, Prague (UTC+2:00)", value: "Europe/Belgrade" },
  { label: "Sarajevo, Skopje, Warsaw, Zagreb (UTC+2:00)", value: "Europe/Warsaw" },
  { label: "Brussels, Copenhagen, Madrid, Paris (UTC+2:00)", value: "Europe/Paris" },
  { label: "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna (UTC+2:00)", value: "Europe/Berlin" },
  { label: "Harare, Pretoria (UTC+2:00)", value: "Africa/Johannesburg" },
  { label: "Frankfurt (UTC+2:00)", value: "Europe/Berlin" },
  { label: "Central European Time (UTC+2:00)", value: "CET" },
  { label: "Central European Summer Time (UTC+3:00)", value: "CET" },
  { label: "Cairo (UTC+3:00)", value: "Africa/Cairo" },
  { label: "Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius (UTC+3:00)", value: "Europe/Helsinki" },
  { label: "Athens (UTC+3:00)", value: "Europe/Athens" },
  { label: "Jerusalem (UTC+3:00)", value: "Asia/Jerusalem" },
  { label: "Istanbul, Minsk, Moscow, St. Petersburg, Volgograd (UTC+3:00)", value: "Europe/Moscow" },
  { label: "Kuwait, Riyadh (UTC+3:00)", value: "Asia/Riyadh" },
  { label: "Nairobi (UTC+3:00)", value: "Africa/Nairobi" },
  { label: "Baghdad (UTC+3:00)", value: "Asia/Baghdad" },
  { label: "Tehran (UTC+3:30)", value: "Asia/Tehran" },
  { label: "Abu Dhabi, Muscat (UTC+4:00)", value: "Asia/Dubai" },
  { label: "Baku, Tbilisi, Yerevan (UTC+4:00)", value: "Asia/Baku" },
  { label: "Kabul (UTC+4:30)", value: "Asia/Kabul" },
  { label: "Ekaterinburg (UTC+5:00)", value: "Asia/Yekaterinburg" },
  { label: "Islamabad, Karachi, Tashkent (UTC+5:00)", value: "Asia/Karachi" },
  { label: "Chennai, Kolkata, Mumbai, New Delhi (UTC+5:30)", value: "Asia/Kolkata" },
  { label: "Sri Jayawardenepura (UTC+5:30)", value: "Asia/Colombo" },
  { label: "Kathmandu (UTC+5:45)", value: "Asia/Kathmandu" },
  { label: "Astana, Dhaka (UTC+6:00)", value: "Asia/Dhaka" },
  { label: "Almaty, Novosibirsk (UTC+6:00)", value: "Asia/Almaty" },
  { label: "Yangon Rangoon (UTC+6:30)", value: "Asia/Yangon" },
  { label: "Bangkok, Hanoi, Jakarta (UTC+7:00)", value: "Asia/Bangkok" },
  { label: "Krasnoyarsk (UTC+7:00)", value: "Asia/Krasnoyarsk" },
  { label: "Beijing, Chongqing, Hong Kong SAR, Urumqi (UTC+8:00)", value: "Asia/Shanghai" },
  { label: "Kuala Lumpur, Singapore (UTC+8:00)", value: "Asia/Singapore" },
  { label: "Taipei (UTC+8:00)", value: "Asia/Taipei" },
  { label: "Perth (UTC+8:00)", value: "Australia/Perth" },
  { label: "Irkutsk, Ulaanbaatar (UTC+8:00)", value: "Asia/Irkutsk" },
  { label: "Seoul (UTC+9:00)", value: "Asia/Seoul" },
  { label: "Osaka, Sapporo, Tokyo (UTC+9:00)", value: "Asia/Tokyo" },
  { label: "Yakutsk (UTC+9:00)", value: "Asia/Yakutsk" },
  { label: "Darwin (UTC+9:30)", value: "Australia/Darwin" },
  { label: "Adelaide (UTC+9:30)", value: "Australia/Adelaide" },
  { label: "Canberra, Melbourne, Sydney (UTC+10:00)", value: "Australia/Sydney" },
  { label: "Brisbane (UTC+10:00)", value: "Australia/Brisbane" },
  { label: "Hobart (UTC+10:00)", value: "Australia/Hobart" },
  { label: "Vladivostok (UTC+10:00)", value: "Asia/Vladivostok" },
  { label: "Guam, Port Moresby (UTC+10:00)", value: "Pacific/Port_Moresby" },
  { label: "Magadan, Solomon Islands, New Caledonia (UTC+11:00)", value: "Asia/Magadan" },
  { label: "Kamchatka, Marshall Islands (UTC+12:00)", value: "Asia/Kamchatka" },
  { label: "Fiji Islands (UTC+12:00)", value: "Pacific/Fiji" },
  { label: "Auckland, Wellington (UTC+12:00)", value: "Pacific/Auckland" },
  { label: "Nuku'alofa (UTC+13:00)", value: "Pacific/Tongatapu" },
];

export const currencies = [
  { value: "AFN", label: "Afghan Afghani (؋)" },
  { value: "ALL", label: "Albanian Lek (L)" },
  { value: "DZD", label: "Algerian Dinar (د.ج)" },
  { value: "EUR", label: "Euro (€)" }, // Andorra
  { value: "AOA", label: "Angolan Kwanza (Kz)" },
  { value: "XCD", label: "East Caribbean Dollar ($)" }, // Antigua and Barbuda
  { value: "ARS", label: "Argentine Peso ($)" },
  { value: "AMD", label: "Armenian Dram (֏)" },
  { value: "AUD", label: "Australian Dollar ($)" }, // Australia
  { value: "EUR", label: "Euro (€)" }, // Austria
  { value: "AZN", label: "Azerbaijani Manat (₼)" },
  { value: "BSD", label: "Bahamian Dollar ($)" },
  { value: "BHD", label: "Bahraini Dinar (ب.د)" },
  { value: "BDT", label: "Bangladeshi Taka (৳)" },
  { value: "BBD", label: "Barbadian Dollar ($)" },
  { value: "BYN", label: "Belarusian Ruble (Br)" },
  { value: "EUR", label: "Euro (€)" }, // Belgium
  { value: "BZD", label: "Belize Dollar ($)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Benin
  { value: "BTN", label: "Bhutanese Ngultrum (Nu.)" },
  { value: "BOB", label: "Bolivian Boliviano (Bs.)" },
  { value: "BAM", label: "Bosnia and Herzegovina Convertible Mark (KM)" },
  { value: "BWP", label: "Botswana Pula (P)" },
  { value: "BRL", label: "Brazilian Real (R$)" },
  { value: "BND", label: "Brunei Dollar ($)" },
  { value: "BGN", label: "Bulgarian Lev (лв)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Burkina Faso
  { value: "BIF", label: "Burundian Franc (FBu)" },
  { value: "KHR", label: "Cambodian Riel (៛)" },
  { value: "XAF", label: "Central African CFA Franc (CFA)" }, // Cameroon
  { value: "CAD", label: "Canadian Dollar ($)" },
  { value: "CVE", label: "Cape Verdean Escudo ($)" },
  { value: "XAF", label: "Central African CFA Franc (CFA)" }, // Central African Republic
  { value: "XAF", label: "Central African CFA Franc (CFA)" }, // Chad
  { value: "CLP", label: "Chilean Peso ($)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
  { value: "COP", label: "Colombian Peso ($)" },
  { value: "KMF", label: "Comorian Franc (CF)" },
  { value: "CDF", label: "Congolese Franc (FC)" },
  { value: "XAF", label: "Central African CFA Franc (CFA)" }, // Republic of the Congo
  { value: "CRC", label: "Costa Rican Colón (₡)" },
  { value: "EUR", label: "Euro (€)" }, // Croatia
  { value: "CUP", label: "Cuban Peso ($)" },
  { value: "EUR", label: "Euro (€)" }, // Cyprus
  { value: "CZK", label: "Czech Koruna (Kč)" },
  { value: "DKK", label: "Danish Krone (kr)" },
  { value: "DJF", label: "Djiboutian Franc (Fdj)" },
  { value: "XCD", label: "East Caribbean Dollar ($)" }, // Dominica
  { value: "DOP", label: "Dominican Peso ($)" },
  { value: "USD", label: "United States Dollar ($)" }, // East Timor
  { value: "USD", label: "United States Dollar ($)" }, // Ecuador
  { value: "EGP", label: "Egyptian Pound (E£)" },
  { value: "USD", label: "United States Dollar ($)" }, // El Salvador
  { value: "XAF", label: "Central African CFA Franc (CFA)" }, // Equatorial Guinea
  { value: "ERN", label: "Eritrean Nakfa (Nfk)" },
  { value: "EUR", label: "Euro (€)" }, // Estonia
  { value: "SZL", label: "Swazi Lilangeni (E)" },
  { value: "ETB", label: "Ethiopian Birr (Br)" },
  { value: "FJD", label: "Fijian Dollar ($)" },
  { value: "EUR", label: "Euro (€)" }, // Finland
  { value: "EUR", label: "Euro (€)" }, // France
  { value: "XAF", label: "Central African CFA Franc (CFA)" }, // Gabon
  { value: "GMD", label: "Gambian Dalasi (D)" },
  { value: "GEL", label: "Georgian Lari (₾)" },
  { value: "EUR", label: "Euro (€)" }, // Germany
  { value: "GHS", label: "Ghanaian Cedi (₵)" },
  { value: "EUR", label: "Euro (€)" }, // Greece
  { value: "XCD", label: "East Caribbean Dollar ($)" }, // Grenada
  { value: "GTQ", label: "Guatemalan Quetzal (Q)" },
  { value: "GNF", label: "Guinean Franc (FG)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Guinea-Bissau
  { value: "GYD", label: "Guyanese Dollar ($)" },
  { value: "HTG", label: "Haitian Gourde (G)" },
  { value: "EUR", label: "Euro (€)" }, // Holy See (Vatican City)
  { value: "HNL", label: "Honduran Lempira (L)" },
  { value: "HUF", label: "Hungarian Forint (Ft)" },
  { value: "ISK", label: "Icelandic Króna (kr)" },
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "IDR", label: "Indonesian Rupiah (Rp)" },
  { value: "IRR", label: "Iranian Rial (﷼)" },
  { value: "IQD", label: "Iraqi Dinar (ع.د)" },
  { value: "EUR", label: "Euro (€)" }, // Ireland
  { value: "ILS", label: "Israeli New Shekel (₪)" }, // Israel
  { value: "EUR", label: "Euro (€)" }, // Italy
  { value: "JMD", label: "Jamaican Dollar ($)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "JOD", label: "Jordanian Dinar (JD)" },
  { value: "KZT", label: "Kazakhstani Tenge (₸)" },
  { value: "KES", label: "Kenyan Shilling (KSh)" },
  { value: "AUD", label: "Australian Dollar ($)" }, // Kiribati
  { value: "EUR", label: "Euro (€)" }, // Kosovo
  { value: "KWD", label: "Kuwaiti Dinar (د.ك)" },
  { value: "KGS", label: "Kyrgyzstani Som (с)" },
  { value: "LAK", label: "Lao Kip (₭)" },
  { value: "EUR", label: "Euro (€)" }, // Latvia
  { value: "LBP", label: "Lebanese Pound (ل.ل)" },
  { value: "LSL", label: "Lesotho Loti (L)" },
  { value: "LRD", label: "Liberian Dollar ($)" },
  { value: "LYD", label: "Libyan Dinar (ل.د)" },
  { value: "CHF", label: "Swiss Franc (CHF)" }, // Liechtenstein
  { value: "EUR", label: "Euro (€)" }, // Lithuania
  { value: "EUR", label: "Euro (€)" }, // Luxembourg
  { value: "MGA", label: "Malagasy Ariary (Ar)" },
  { value: "MWK", label: "Malawian Kwacha (MK)" },
  { value: "MYR", label: "Malaysian Ringgit (RM)" },
  { value: "MVR", label: "Maldivian Rufiyaa (Rf)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Mali
  { value: "EUR", label: "Euro (€)" }, // Malta
  { value: "USD", label: "United States Dollar ($)" }, // Marshall Islands
  { value: "MRU", label: "Mauritanian Ouguiya (UM)" },
  { value: "MUR", label: "Mauritian Rupee (₨)" },
  { value: "MXN", label: "Mexican Peso ($)" },
  { value: "USD", label: "United States Dollar ($)" }, // Micronesia
  { value: "MDL", label: "Moldovan Leu (L)" },
  { value: "EUR", label: "Euro (€)" }, // Monaco
  { value: "MNT", label: "Mongolian Tögrög (₮)" },
  { value: "EUR", label: "Euro (€)" }, // Montenegro
  { value: "MAD", label: "Moroccan Dirham (د.م)" },
  { value: "MZN", label: "Mozambican Metical (MT)" },
  { value: "MMK", label: "Myanmar Kyat (K)" },
  { value: "NAD", label: "Namibian Dollar ($)" },
  { value: "AUD", label: "Australian Dollar ($)" }, // Nauru
  { value: "NPR", label: "Nepalese Rupee (₨)" },
  { value: "EUR", label: "Euro (€)" }, // Netherlands
  { value: "NZD", label: "New Zealand Dollar ($)" },
  { value: "NIO", label: "Nicaraguan Córdoba (C$)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Niger
  { value: "NGN", label: "Nigerian Naira (₦)" },
  { value: "KPW", label: "North Korean Won (₩)" },
  { value: "MKD", label: "Macedonian Denar (ден)" },
  { value: "NOK", label: "Norwegian Krone (kr)" },
  { value: "OMR", label: "Omani Rial (ر.ع)" },
  { value: "PKR", label: "Pakistani Rupee (₨)" },
  { value: "USD", label: "United States Dollar ($)" }, // Palau
  { value: "ILS", label: "Israeli New Shekel (₪)" }, // Palestine
  { value: "PAB", label: "Panamanian Balboa (B/.)" },
  { value: "PGK", label: "Papua New Guinean Kina (K)" },
  { value: "PYG", label: "Paraguayan Guaraní (₲)" },
  { value: "PEN", label: "Peruvian Sol (S/)" },
  { value: "PHP", label: "Philippine Peso (₱)" },
  { value: "PLN", label: "Polish Złoty (zł)" },
  { value: "EUR", label: "Euro (€)" }, // Portugal
  { value: "QAR", label: "Qatari Riyal (ر.ق)" },
  { value: "RON", label: "Romanian Leu (lei)" },
  { value: "RUB", label: "Russian Ruble (₽)" },
  { value: "RWF", label: "Rwandan Franc (FRw)" },
  { value: "XCD", label: "East Caribbean Dollar ($)" }, // Saint Kitts and Nevis
  { value: "XCD", label: "East Caribbean Dollar ($)" }, // Saint Lucia
  { value: "XCD", label: "East Caribbean Dollar ($)" }, // Saint Vincent and the Grenadines
  { value: "WST", label: "Samoan Tālā (T)" },
  { value: "EUR", label: "Euro (€)" }, // San Marino
  { value: "STN", label: "São Tomé and Príncipe Dobra (Db)" },
  { value: "SAR", label: "Saudi Riyal (ر.س)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Senegal
  { value: "RSD", label: "Serbian Dinar (дин)" },
  { value: "SCR", label: "Seychellois Rupee (₨)" },
  { value: "SLE", label: "Sierra Leonean Leone (Le)" },
  { value: "SGD", label: "Singapore Dollar ($)" },
  { value: "EUR", label: "Euro (€)" }, // Slovakia
  { value: "EUR", label: "Euro (€)" }, // Slovenia
  { value: "SBD", label: "Solomon Islands Dollar ($)" },
  { value: "SOS", label: "Somali Shilling (Sh)" },
  { value: "ZAR", label: "South African Rand (R)" },
  { value: "KRW", label: "South Korean Won (₩)" },
  { value: "SSP", label: "South Sudanese Pound (£)" },
  { value: "EUR", label: "Euro (€)" }, // Spain
  { value: "LKR", label: "Sri Lankan Rupee (₨)" },
  { value: "SDG", label: "Sudanese Pound (ج.س)" },
  { value: "SRD", label: "Surinamese Dollar ($)" },
  { value: "SEK", label: "Swedish Krona (kr)" },
  { value: "CHF", label: "Swiss Franc (CHF)" }, // Switzerland
  { value: "SYP", label: "Syrian Pound (£S)" },
  { value: "TWD", label: "New Taiwan Dollar (NT$)" },
  { value: "TJS", label: "Tajikistani Somoni (SM)" },
  { value: "TZS", label: "Tanzanian Shilling (TSh)" },
  { value: "THB", label: "Thai Baht (฿)" },
  { value: "XOF", label: "West African CFA Franc (CFA)" }, // Togo
  { value: "TOP", label: "Tongan Paʻanga (T$)" },
  { value: "TTD", label: "Trinidad and Tobago Dollar ($)" },
  { value: "TND", label: "Tunisian Dinar (د.ت)" },
  { value: "TRY", label: "Turkish Lira (₺)" },
  { value: "TMT", label: "Turkmenistani Manat (m)" },
  { value: "AUD", label: "Australian Dollar ($)" }, // Tuvalu
  { value: "UGX", label: "Ugandan Shilling (USh)" },
  { value: "UAH", label: "Ukrainian Hryvnia (₴)" },
  { value: "AED", label: "UAE Dirham (د.إ)" },
  { value: "GBP", label: "Pound Sterling (£)" },
  { value: "USD", label: "United States Dollar ($)" }, // United States
  { value: "UYU", label: "Uruguayan Peso ($)" },
  { value: "UZS", label: "Uzbekistani Som (so'm)" },
  { value: "VUV", label: "Vanuatu Vatu (VT)" },
  { value: "VES", label: "Venezuelan Bolívar (Bs.)" },
  { value: "VND", label: "Vietnamese Đồng (₫)" },
  { value: "YER", label: "Yemeni Rial (﷼)" },
  { value: "ZMW", label: "Zambian Kwacha (ZK)" },
  { value: "ZWL", label: "Zimbabwean Dollar ($)" },
];

export const countries = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belarus", label: "Belarus" },
  { value: "Belgium", label: "Belgium" },
  { value: "Belize", label: "Belize" },
  { value: "Benin", label: "Benin" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Brunei", label: "Brunei" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cabo Verde", label: "Cabo Verde" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Canada", label: "Canada" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chad", label: "Chad" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo, Democratic Republic of the", label: "Congo, Democratic Republic of the" },
  { value: "Congo, Republic of the", label: "Congo, Republic of the" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Denmark", label: "Denmark" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Dominica", label: "Dominica" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Estonia", label: "Estonia" },
  { value: "Eswatini", label: "Eswatini" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Fiji", label: "Fiji" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Germany" },
  { value: "Ghana", label: "Ghana" },
  { value: "Greece", label: "Greece" },
  { value: "Grenada", label: "Grenada" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-Bissau", label: "Guinea-Bissau" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  { value: "Honduras", label: "Honduras" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Ireland", label: "Ireland" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Japan", label: "Japan" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Korea, North", label: "Korea, North" },
  { value: "Korea, South", label: "Korea, South" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  { value: "Laos", label: "Laos" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mali", label: "Mali" },
  { value: "Malta", label: "Malta" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Mexico", label: "Mexico" },
  { value: "Micronesia", label: "Micronesia" },
  { value: "Moldova", label: "Moldova" },
  { value: "Monaco", label: "Monaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Myanmar", label: "Myanmar" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nauru", label: "Nauru" },
  { value: "Nepal", label: "Nepal" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Niger", label: "Niger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "North Macedonia", label: "North Macedonia" },
  { value: "Norway", label: "Norway" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Palau", label: "Palau" },
  { value: "Panama", label: "Panama" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Philippines", label: "Philippines" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Qatar", label: "Qatar" },
  { value: "Romania", label: "Romania" },
  { value: "Russia", label: "Russia" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
  { value: "Saint Lucia", label: "Saint Lucia" },
  { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
  { value: "Samoa", label: "Samoa" },
  { value: "San Marino", label: "San Marino" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Serbia", label: "Serbia" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Singapore", label: "Singapore" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Sudan", label: "South Sudan" },
  { value: "Spain", label: "Spain" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Sudan", label: "Sudan" },
  { value: "Suriname", label: "Suriname" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Syria", label: "Syria" },
  { value: "Taiwan", label: "Taiwan" },
  { value: "Tajikistan", label: "Tajikistan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Thailand", label: "Thailand" },
  { value: "Togo", label: "Togo" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Turkey", label: "Turkey" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Uganda", label: "Uganda" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Vatican City", label: "Vatican City" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Yemen", label: "Yemen" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
];

export const timelineEvents = [
  { label: "Initial Contact Made", value: "Initial Contact Made" },
  { label: "Call Made", value: "Call Made" },
  { label: "Call Attempted (No Response)", value: "Call Attempted (No Response)" },
  { label: "Email Sent", value: "Email Sent" },
  { label: "WhatsApp Sent", value: "WhatsApp Sent" },
  { label: "Follow-up Scheduled", value: "Follow-up Scheduled" },
  { label: "Follow-up Completed", value: "Follow-up Completed" },
  { label: "Meeting Scheduled", value: "Meeting Scheduled" },
  { label: "Meeting Done", value: "Meeting Done" },
  { label: "Site Visit Scheduled", value: "Site Visit Scheduled" },
  { label: "Site Visit Done", value: "Site Visit Done" },
  { label: "Proposal Sent", value: "Proposal Sent" },
  { label: "Negotiation Started", value: "Negotiation Started" },
  { label: "Negotiation Completed", value: "Negotiation Completed" },
  { label: "Booking Form Sent", value: "Booking Form Sent" },
  { label: "Booking Confirmed", value: "Booking Confirmed" },
  { label: "Token Payment Received", value: "Token Payment Received" },
  { label: "Agreement Signed", value: "Agreement Signed" },
  { label: "Loan Process Started", value: "Loan Process Started" },
  { label: "Loan Approved", value: "Loan Approved" },
  { label: "Payment Milestone Completed", value: "Payment Milestone Completed" },
  { label: "Deal Closed", value: "Deal Closed" },
  { label: "Deal Lost", value: "Deal Lost" },
  { label: "Lead Nurture", value: "Lead Nurture" },
  { label: "Lead Archived", value: "Lead Archived" },
  { label: "Other", value: "Other" },
];
