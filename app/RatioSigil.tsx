interface RatioSigilProps {
  value: number;
  min: number;
  max: number;
  size?: number;
  label: string;
  title: string;
  classNames?: string;
}

const RatioSigil: React.FC<RatioSigilProps> = ({
  value,
  min,
  max,
  label,
  title,
  classNames = '',
}) => {
  const minValueShift = Math.abs(min);
  const shiftedValue = value + minValueShift;
  const shiftedMax = max + minValueShift;
  const ratio = Math.max(0, Math.min(1, shiftedValue / shiftedMax));

  return (
    <div className={`flex flex-col gap-0.5 items-begin ${classNames}`} title={title}>
      <div className="bg-gray-700 w-8 h-1">
        <div
          className="h-full bg-current"
          style={{ width: `calc(100% * ${ratio})` }}
        ></div>
      </div>
      <span className="text-xs font-mono text-center">
          {value.toFixed(2)}
        </span>
    </div>
  );
};

export default RatioSigil;