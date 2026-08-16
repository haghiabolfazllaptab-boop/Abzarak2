export type CategoryKey = "all" | "calc" | "convert" | "datetime" | "textcolor" | "utility";

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: Exclude<CategoryKey, "all">;
  icon: string;
}

export const categories: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "calc", label: "محاسبات" },
  { key: "convert", label: "تبدیل‌ها" },
  { key: "datetime", label: "تاریخ و زمان" },
  { key: "textcolor", label: "متن و رنگ" },
  { key: "utility", label: "ابزارهای کاربردی" },
];

export const tools: ToolMeta[] = [
  {
    id: "calculator",
    name: "ماشین حساب",
    description: "محاسبات سریع و روزمره با پشتیبانی از پرانتز و درصد",
    category: "calc",
    icon: "🧮",
  },
  {
    id: "discount",
    name: "محاسبه تخفیف",
    description: "قیمت نهایی و مقدار تخفیف را سریع محاسبه کنید",
    category: "calc",
    icon: "🏷️",
  },
  {
    id: "age",
    name: "محاسبه سن",
    description: "سن دقیق خود را بر اساس تاریخ تولد محاسبه کنید",
    category: "datetime",
    icon: "🎂",
  },
  {
    id: "dateDiff",
    name: "اختلاف دو تاریخ",
    description: "فاصله بین دو تاریخ را بر حسب روز، هفته و ساعت ببینید",
    category: "datetime",
    icon: "📅",
  },
  {
    id: "unitConverter",
    name: "تبدیل واحد",
    description: "تبدیل واحدهای طول، وزن، حجم، دما، سرعت و مساحت",
    category: "convert",
    icon: "🔁",
  },
  {
    id: "bmi",
    name: "محاسبه شاخص توده بدنی",
    description: "وضعیت وزن بدن خود را بر اساس قد و وزن بررسی کنید",
    category: "calc",
    icon: "⚖️",
  },
  {
    id: "percentage",
    name: "محاسبه درصد",
    description: "انواع محاسبات درصدی را به‌سادگی انجام دهید",
    category: "calc",
    icon: "٪",
  },
  {
    id: "installment",
    name: "محاسبه اقساط",
    description: "مبلغ تقریبی اقساط و مجموع پرداخت را تخمین بزنید",
    category: "calc",
    icon: "💳",
  },
  {
    id: "average",
    name: "محاسبه میانگین",
    description: "میانگین، بیشترین و کمترین مقدار یک مجموعه عدد",
    category: "calc",
    icon: "📊",
  },
  {
    id: "colorTool",
    name: "ابزار رنگ",
    description: "تبدیل بین کدهای HEX، RGB و HSL و انتخاب رنگ",
    category: "textcolor",
    icon: "🎨",
  },
  {
    id: "textCounter",
    name: "شمارش متن",
    description: "تعداد حروف، کلمات، خطوط و پاراگراف‌های متن",
    category: "textcolor",
    icon: "📝",
  },
  {
    id: "timer",
    name: "تایمر",
    description: "شمارش معکوس برای یادآوری و مدیریت زمان",
    category: "datetime",
    icon: "⏲️",
  },
  {
    id: "stopwatch",
    name: "کرنومتر",
    description: "زمان‌سنجی دقیق با قابلیت ثبت دور",
    category: "datetime",
    icon: "⏱️",
  },
  {
    id: "downloadTime",
    name: "زمان دانلود",
    description: "زمان تقریبی دانلود فایل را بر اساس سرعت اینترنت محاسبه کنید",
    category: "utility",
    icon: "⬇️",
  },
  {
    id: "passwordGenerator",
    name: "تولید رمز عبور",
    description: "ساخت رمز عبور امن و تصادفی با تنظیمات دلخواه",
    category: "utility",
    icon: "🔐",
  },
];

export function getToolById(id: string): ToolMeta | undefined {
  return tools.find((t) => t.id === id);
}
