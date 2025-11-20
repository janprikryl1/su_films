export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
};

export const formatRuntime = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

export const getRatingColor = (rating: number) => {
    if (rating >= 8) return "bg-green-500";
    if (rating >= 6) return "bg-yellow-500";
    return "bg-red-500";
};

export const getVisiblePages = (currentPage: number, totalPages: number) => {
        const visiblePages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    visiblePages.push(i);
                }
                visiblePages.push(-1);
                visiblePages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                visiblePages.push(1);
                visiblePages.push(-1);
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    visiblePages.push(i);
                }
            } else {
                visiblePages.push(1);
                visiblePages.push(-1);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    visiblePages.push(i);
                }
                visiblePages.push(-1);
                visiblePages.push(totalPages);
            }
        }
        return visiblePages;
};

export const generateColors = (n: number) => {
    const baseColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    return baseColors.slice(0, n);
};
