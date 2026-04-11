/**
 * SkeletonCard — Reusable loading skeleton
 * Props:
 *   variant: 'card' | 'list' | 'stat' | 'auction' | 'text'
 *   count: number (số lần lặp)
 *   className: extra classes
 */

const shimmer = {
    background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEB 50%, #F3F4F6 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
};

function Box({ w = '100%', h = 16, r = 8, style = {} }) {
    return (
        <div style={{ width: w, height: h, borderRadius: r, ...shimmer, ...style }} />
    );
}

// ── Variants ─────────────────────────────────────────────────────────────────

function AuctionCardSkeleton() {
    return (
        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #F3F4F6', padding: '1.25rem', overflow: 'hidden' }}>
            <Box h={180} r={12} style={{ marginBottom: 12 }} />
            <Box w="60%" h={14} r={6} style={{ marginBottom: 8 }} />
            <Box w="40%" h={12} r={6} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box w="45%" h={24} r={8} />
                <Box w="30%" h={32} r={100} />
            </div>
        </div>
    );
}

function ListItemSkeleton() {
    return (
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
            <Box w={44} h={44} r={12} />
            <div style={{ flex: 1 }}>
                <Box w="55%" h={14} r={6} style={{ marginBottom: 6 }} />
                <Box w="35%" h={11} r={6} />
            </div>
            <Box w={80} h={20} r={100} />
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F3F4F6', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Box w={40} h={40} r={12} />
                <Box w={60} h={20} r={100} />
            </div>
            <Box w="70%" h={28} r={8} style={{ marginBottom: 6 }} />
            <Box w="45%" h={12} r={6} />
        </div>
    );
}

function TextSkeleton({ lines = 3 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Box key={i} w={i === lines - 1 ? '60%' : '100%'} h={14} r={6} />
            ))}
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SkeletonCard({
    variant = 'auction',
    count = 1,
    className = '',
}) {
    const Skeleton = {
        auction: AuctionCardSkeleton,
        list: ListItemSkeleton,
        stat: StatCardSkeleton,
        text: TextSkeleton,
        card: AuctionCardSkeleton,
    }[variant] || AuctionCardSkeleton;

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={className}>
                    <Skeleton />
                </div>
            ))}
        </>
    );
}

// Named exports for convenience
export { AuctionCardSkeleton, ListItemSkeleton, StatCardSkeleton, TextSkeleton };
