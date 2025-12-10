import React from 'react'

const SortedCustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        // Sort payload by value in descending order
        // Create a copy to avoid mutating the original payload
        const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

        return (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg backdrop-blur-sm bg-opacity-90">
                <p className="text-slate-300 font-medium mb-2 pb-2 border-b border-slate-700">{label}</p>
                <div className="space-y-1">
                    {sortedPayload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}
                                />
                                <span className="text-slate-400" style={{ color: entry.color || entry.fill || entry.stroke }}>
                                    {entry.name}:
                                </span>
                            </div>
                            <span className="font-mono font-medium text-slate-200">
                                {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

export default SortedCustomTooltip;
