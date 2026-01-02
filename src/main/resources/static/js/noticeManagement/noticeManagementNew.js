$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');


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

        const imageDataList = [];
        let imageCount = 0;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('data:')) {
                imageCount++;
                imageDataList.push(src);

                img.removeAttribute('src');
            }
        });

        const processedHtml = tempDiv.innerHTML;

        sessionStorage.setItem("quillContent", processedHtml);
        sessionStorage.setItem("quillImageData", JSON.stringify(imageDataList));

        document.getElementById('hiddenContent').value = html === '<p><br></p>' ? '' : processedHtml;
        document.getElementById('hiddenImageData').value = JSON.stringify(imageDataList);

        console.log('✅ 저장할 HTML:', processedHtml);
        console.log('✅ 이미지 개수:', imageDataList.length);
    });

    $("form").on("submit", function (e) {
        e.preventDefault();

        const dto = {
            title: $("#title").val(),
            description: $("#hiddenContent").val()
        };

        const formData = new FormData();
        formData.append("dto", new Blob([JSON.stringify(dto)], {type: "application/json"}));

        const thumbnailFile = $("#thumbnail")[0].files[0];
        if (thumbnailFile) {
            formData.append("thumbnail", thumbnailFile);
        }

        const imageDataList = JSON.parse($("#hiddenImageData").val() || '[]');
        imageDataList.forEach((imageData, index) => {
            const blob = processImage(imageData, index);
            const fileName = `image${index + 1}.${imageData.split('/')[1].split(';')[0]}`;
            formData.append("images", blob, fileName);
        });

        $.ajax({
            url: "/noticeManagement/newNotice",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function (res) {
                alert("Notice created successfully.");

                sessionStorage.removeItem('quillContent');
                sessionStorage.removeItem('issueFormData');

                if (res) window.location.href = "/noticeManagement/noticeManagement";
            },
            error: function (xhr) {
                console.error(xhr);
                alert("Notice registration failed!");
            }
        });
    });
});

