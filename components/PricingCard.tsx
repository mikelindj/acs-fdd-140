import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react"; // We'll use the Check icon

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  priceDetail: string;
  features: string[];
  href: string;
  isPopular?: boolean; // Optional prop
  buttonText?: string;
  variant?: "default" | "outline"; // To switch button styles
}

export function PricingCard({
  title,
  subtitle,
  price,
  priceDetail,
  features,
  href,
  isPopular = false,
  buttonText = "Book Now",
  variant = "default",
}: PricingCardProps) {
  return (
    <div className={`group relative p-10 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden ${isPopular ? 'hover:border-brand-red/30' : 'hover:border-secondary/50'}`}>
      
      {/* Dynamic Gradient Bar */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${isPopular ? 'from-primary via-brand-red to-secondary' : 'from-secondary to-primary'}`} />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
        </div>
        {isPopular && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </span>
        )}
      </div>

      <div className="flex items-baseline text-slate-900 mb-8">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
        <span className="ml-2 text-base font-medium text-slate-500">{priceDetail}</span>
      </div>

      <ul className="space-y-4 text-sm text-slate-600 mb-10">
        {features.map((feature, index) => (
          <li key={index} className="flex gap-3 items-center">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${isPopular ? 'bg-secondary/20 text-secondary-foreground' : 'bg-slate-100 text-slate-600'}`}>
              ✓
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <Link href={href} className="block w-full">
        <Button 
          variant={variant}
          className={`w-full h-14 text-base font-bold rounded-xl transition-all ${
            variant === 'default' 
            ? 'bg-primary hover:bg-brand-red shadow-lg hover:shadow-brand-red/25' 
            : 'border-2 border-slate-200 text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5'
          }`}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}