export default function ProgressBar({ value, max = 100, color = 'emerald', size = 'md', showLabel = true }) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const colorClasses = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500'
    };

    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${colorClasses[color]} h-full rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
            )}
        </div>
    );
}
