type PlateProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** 例如 "4 / 3"。不传则由外层 flex 撑开高度。 */
  ratio?: string;
  eager?: boolean;
  className?: string;
};

/**
 * 双色调图片框。照片先被去色，再叠一层品牌色纱，让所有图片共用同一套色彩语言。
 * hover / focus 时纱层退开，露出原色，作为可点击的反馈。
 */
export function Plate({
  src,
  alt,
  width,
  height,
  ratio,
  eager = false,
  className = "",
}: PlateProps) {
  return (
    <div className={`plate ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}
