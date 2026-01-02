$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    function handleSelectValueByTab(selectId, inputId) {
        $(selectId).change(function () {
            $(inputId).val($(selectId).val());
        })
    }
    handleSelectValueByTab("#prioritySelect", "#priorityInput");
    handleSelectValueByTab("#categorySelect", "#categoryInput");
    handleSelectValueByTab("#typeSelect", "#typeInput");

    const snowEditor = new Quill('#snow-editor', {
        theme: 'snow',
        placeholder: `Please include only one issue or request per ticket.

[Problem]
• (Example) When clicking the “Sign Up” button, an error appears saying “The connection to the server has been lost.”

[Expected Result]
• (Example) Upon clicking the button, the sign-up process should complete without errors.

[Environment and Time of Occurrence]
• (Example) Occurred at 4:36 PM using the Chrome browser.`,

        modules: {
            toolbar: [
                [{ 'size': ['small', false, 'large', 'huge'] }],
                // [{ 'header': 1 }, { 'header': 2 }],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'color': [] }],
                ['image']
            ]
        }
    });

    function processImage(imageData, index) {
        // Base64 데이터에서 MIME 타입 추출
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
        const extension = mimeType.split('/')[1];
        const fileName = `image${index + 1}.${extension}`;

        // Base64 데이터를 Blob으로 변환
        const byteString = atob(imageData.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeType });
    }

    const savedContent = sessionStorage.getItem("quillContent");
    const savedImageData = sessionStorage.getItem("quillImageData");

    if (savedContent) {
        snowEditor.root.innerHTML = savedContent;
        if (savedImageData) {
            document.getElementById('hiddenImageData').value = savedImageData;
        }

    }
    $(window).on('unload', function() {
        sessionStorage.removeItem('quillContent');
        sessionStorage.removeItem('issueFormData');
    });

    snowEditor.on('text-change', function () {
        const html = snowEditor.root.innerHTML.trim();
        sessionStorage.setItem("quillContent", html);

        let processedContent = '';
        const imageDataList = [];
        let imageCount = 0;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 이미지와 텍스트 처리
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                processedContent += node.textContent;
            } else if (node.nodeName === 'IMG') {
                imageCount++;
                const src = node.getAttribute('src');
                if (src && src.startsWith('data:')) {
                    imageDataList.push(src);
                    const placeholder = `image${imageCount}`;
                    processedContent += placeholder;
                    node.setAttribute('src', placeholder);
                }
            } else if (node.nodeName === 'BR') {
                if (!processedContent.endsWith('\\n')) {
                    if (node.parentNode && (node.parentNode.nodeName === 'P' || node.parentNode.nodeName === 'DIV')) {
                        if (node === node.parentNode.lastChild) {
                            processedContent += '\\n';
                        }
                    } else {
                        processedContent += '\\n';
                    }
                }
            } else if (node.nodeName === 'P' || node.nodeName === 'DIV') {
                let hasOnlyBr = node.childNodes.length === 1 && node.firstChild.nodeName === 'BR';

                for (let child of node.childNodes) {
                    processNode(child);
                }

                if (!processedContent.endsWith('\\n') && node.nextSibling &&
                    (hasOnlyBr || node.textContent.trim().length > 0)) {
                    processedContent += '\\n';
                }
            } else {
                for (let child of node.childNodes) {
                    processNode(child);
                }
            }
        }

        processNode(tempDiv);
        processedContent = processedContent.trim();

        document.getElementById('hiddenContent').value = html === '<p><br></p>' ? '' : processedContent;
        document.getElementById('hiddenImageData').value = JSON.stringify(imageDataList);
    });

    $("form").on("submit", function (e) {
        e.preventDefault();

        const dto = {
            title: $("#title").val(),
            priority: $("#prioritySelect").val(),
            category: $("#categorySelect").val(),
            type: $("#typeSelect").val(),
            description: $("#hiddenContent").val()
        };

        const formData = new FormData();
        formData.append("dto", new Blob([JSON.stringify(dto)], {type: "application/json"}));

        const imageDataList = JSON.parse($("#hiddenImageData").val() || '[]');
        imageDataList.forEach((imageData, index) => {
            const blob = processImage(imageData, index);
            const fileName = `image${index + 1}.${imageData.split('/')[1].split(';')[0]}`;
            formData.append("images", blob, fileName);
        });

        $.ajax({
            url: "/issueManagement/newIssue",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader(header, token);
            },
            success: function (res) {
                alert("Issue created successfully.");

                sessionStorage.removeItem('quillContent');
                sessionStorage.removeItem('issueFormData');

                if (res) window.location.href = "/issueManagement/issueManagement";
            },
            error: function (xhr) {
                console.error(xhr);
                alert("Issue registration failed!");
            }
        });
    });
});