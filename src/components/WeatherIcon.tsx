import React from "react";
import {
  Sun,
  SunDim,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudHail,
  CloudSunRain,
  Snowflake,
  CloudSnow,
  CloudLightning,
  LucideProps,
} from "lucide-react";

interface WeatherIconProps extends LucideProps {
  name: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, ...props }) => {
  switch (name) {
    case "Sun":
      return <Sun {...props} />;
    case "SunDim":
      return <SunDim {...props} />;
    case "Moon":
      return <Moon {...props} />;
    case "CloudSun":
      return <CloudSun {...props} />;
    case "CloudMoon":
      return <CloudMoon {...props} />;
    case "Cloud":
      return <Cloud {...props} />;
    case "CloudFog":
      return <CloudFog {...props} />;
    case "CloudDrizzle":
      return <CloudDrizzle {...props} />;
    case "CloudRain":
      return <CloudRain {...props} />;
    case "CloudRainWind":
      return <CloudRainWind {...props} />;
    case "CloudHail":
      return <CloudHail {...props} />;
    case "CloudSunRain":
      return <CloudSunRain {...props} />;
    case "Snowflake":
      return <Snowflake {...props} />;
    case "CloudSnow":
      return <CloudSnow {...props} />;
    case "CloudLightning":
      return <CloudLightning {...props} />;
    default:
      return <CloudSun {...props} />;
  }
};
