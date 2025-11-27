export default function Card({ children, className = '', hover = true }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 ${hover ? 'hover:shadow-md hover:border-emerald-200 transition-all duration-200' : ''
            } ${className}`}>
            {children}
        </div>
    );
}
