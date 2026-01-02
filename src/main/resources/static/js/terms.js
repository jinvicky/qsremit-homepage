// Terms 페이지 관련 추가 기능

document.addEventListener('DOMContentLoaded', function () {
    console.log('Terms page loaded');

    // 부드러운 스크롤 효과
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 인쇄 기능 추가 (필요한 경우)
    const addPrintButton = () => {
        const contentDiv = document.querySelector('.text-lg.max-w-prose');
        if (contentDiv) {
            const printBtn = document.createElement('button');
            printBtn.textContent = '인쇄';
            printBtn.className = 'mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none';
            printBtn.addEventListener('click', () => {
                window.print();
            });
            // 필요시 버튼 추가
            // contentDiv.appendChild(printBtn);
        }
    };

    // addPrintButton(); // 필요시 주석 해제
});

