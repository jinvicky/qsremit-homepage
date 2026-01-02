function createAnchorLinks(anchors, containerId) {
    // anchor 유효성 검사
    if (!Array.isArray(anchors) || anchors.length === 0) {
        console.error("Invalid or empty anchors array. Expected non-empty array:", anchors);
        return;
    }
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container with ID "${containerId}" not found.`);
        return;
    }

    const nav = document.createElement("div");
    nav.className = "btn-group dropup";
    nav.style.position = "fixed"; // 위치 고정
    nav.style.bottom = "10px"; // 하단에서 10px
    nav.style.right = "10px"; // 오른쪽에서 10px
    nav.style.zIndex = "1000"; // 다른 요소 위에 표시
    nav.id = 'anchor-nav';

    // 드롭다운 버튼 생성
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-purple dropdown-toggle";
    button.setAttribute("data-bs-toggle", "dropdown");
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("data-bs-auto-close", "outside"); // 아이템 클릭해도 닫히지 않게
    button.innerHTML = `Quick Navigation <i class="mdi mdi-chevron-up"></i>`;

    // 드롭다운 목록 생성
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu";

    // anchors 배열 순회하며 드롭다운 아이템 생성
    anchors.forEach((anchor, index) => {
        if (!anchor.id || !anchor.text) {
            console.warn(`Anchor at index ${index} is missing required properties:`, anchor);
            return;
        }

        const dropdownItem = document.createElement("a");
        dropdownItem.className = "dropdown-item";
        dropdownItem.href = `#${anchor.id}`;
        dropdownItem.textContent = anchor.text;

        dropdownItem.addEventListener("click", function (e) {
            e.preventDefault();

            const targetElement = document.getElementById(anchor.id);
            if (targetElement) {
                // 상단 메뉴바 높이를 고려하여 스크롤 위치 조정
                const topOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - topOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            } else {
                console.warn("Target element not found for ID:", anchor.id);
            }

        });

        dropdownMenu.appendChild(dropdownItem);
    });

    nav.appendChild(button);
    nav.appendChild(dropdownMenu);
    document.body.appendChild(nav);
}
