$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    let originalData = {};

    // Quill 에디터 초기화
    const quill = new Quill('#noticeEditor', {
        theme: 'snow',
        placeholder: 'Enter the notice details here...',
        modules: {
            toolbar: {
                container: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }],
                    ['image']
                ],
                handlers: {
                    image: imageHandler
                }
            }
        }
    });

    // 커스텀 이미지 핸들러
    function imageHandler() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = function () {
            const file = input.files[0];
            if (file) {
                console.log("이미지 선택:", file.name);
                const reader = new FileReader();
                reader.onload = function (e) {
                    const base64Data = e.target.result;
                    console.log("Base64 변환 완료:", base64Data.substring(0, 50));

                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', base64Data);
                    quill.setSelection(range.index + 1);

                    console.log("이미지 삽입 완료");
                };
                reader.readAsDataURL(file);
            }
        };
    }

    function processImage(dataUrl) {

        const parts = dataUrl.split(',');
        const meta = parts[0];
        const base64 = parts[1];

        const mimeMatch = meta.match(/data:(.*?);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return new Blob([bytes], { type: mimeType });
    }

    quill.on('text-change', function () {
        const html = quill.root.innerHTML.trim();
        const imageDataList = [];

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('data:')) {
                imageDataList.push(src);
            }
        });

        const cleanContent = html === '<p><br></p>' ? '' : html;

        document.getElementById('hiddenContent').value = cleanContent;
        document.getElementById('hiddenImageData').value = JSON.stringify(imageDataList);

        console.log("✅ 저장할 HTML:", cleanContent);
        console.log("✅ 이미지 개수:", imageDataList.length);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const noticeId = urlParams.get("noticeId");

    if (noticeId) {
        $.ajax({
            url: `/noticeManagement/noticeDetail/${noticeId}`,
            method: "GET",
            success: function (notice) {
                console.log("===== 백엔드 응답 전체 =====");
                console.log("notice:", notice);
                console.log("notice.images:", notice.images);
                console.log("notice.images 길이:", notice.images ? notice.images.length : "null/undefined");

                const assigneeVal = notice.assignee;

                originalData = {
                    title: notice.title,
                    assignee: assigneeVal,
                    description: notice.description
                };

                $("#title").val(notice.title);

                $("#assigneeSelect option").each(function () {
                    if ($(this).val() === assigneeVal) {
                        $(this).prop("selected", true);
                    }
                });

                $("#writer").html(notice.user);

                let descHtml = notice.description
                    ? notice.description.replace(/\\n/g, '<br>')
                    : '';

                descHtml = descHtml.replace(/class=['"]noticeManagement-image['"]/g, 'class="notice-image"');

                const imageDataList = [];

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = descHtml;

                if (notice.images && notice.images.length > 0) {
                    const imgTags = tempDiv.querySelectorAll('img');

                    notice.images.forEach(function (img, index) {
                        imageDataList.push(img.base64Data);

                        if (imgTags[index]) {
                            imgTags[index].setAttribute('src', img.base64Data);
                        }
                    });
                    console.log("불러온 이미지 데이터:", imageDataList.length, "개");
                }

                quill.root.innerHTML = tempDiv.innerHTML;

                let contentForSave = notice.description || '';
                if (notice.images && notice.images.length > 0) {
                    notice.images.forEach(function (img, index) {
                        const placeholder = `image${index + 1}`;
                        const base64 = img.base64Data;

                        if (base64) {
                            contentForSave = contentForSave.replace(base64, placeholder);
                        }
                    });
                }

                $("#hiddenContent").val(contentForSave === '<p><br></p>' ? '' : contentForSave);


                document.getElementById('hiddenImageData').value = JSON.stringify(imageDataList);

                if (notice.thumbnailBase64) {
                    $("#currentThumbnailPreview").html(`
                         <p class="mb-1 text-muted">Current Thumbnail:</p>
                         <img src="${notice.thumbnailBase64}"
                              alt="thumbnail"
                              style="max-width:160px; border:1px solid #ccc; border-radius:4px;" />
                    `);
                }

                if (notice.file) {
                    $("#fileLink").attr("href", `/files/${notice.file}`);
                    $("#fileSection").show();
                }

                $(quill.root).find('img').each(function () {
                    $(this)
                        .addClass('notice-image')
                        .attr('data-bs-toggle', 'modal')
                        .attr('data-bs-target', '#noticeImageViewer');
                });
            },
            error: function () {
                alert("공지 상세 정보를 불러오지 못했습니다.");
            }
        });
    }


    $(document).on('click', '.notice-image', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const imgSrc = $(this).attr('src');
        $('#modalImage').attr('src', imgSrc);
        $('#issueImageViewer').modal('show');
    });


    $("form").on("submit", function (e) {
        e.preventDefault();

        const currentHtml = quill.root.innerHTML.trim();
        const imageDataList = [];

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentHtml;

        const images = tempDiv.querySelectorAll('img');
        images.forEach((img, index) => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('data:')) {
                imageDataList.push(src);
                img.setAttribute('src', `image${index + 1}`);
            }
        });

        const processedHtml = tempDiv.innerHTML;

        const updatedData = {
            title: $("#title").val(),
            assignee: $("#assigneeSelect").val(),
            description: processedHtml
        };

        const formData = new FormData();
        formData.append("dto", new Blob([JSON.stringify(updatedData)], { type: "application/json" }));

        console.log("===== 저장할 이미지 개수 =====", imageDataList.length);

        imageDataList.forEach((imageData, index) => {
            if (imageData && imageData.startsWith('data:')) {
                console.log(`Image ${index + 1}:`, imageData.substring(0, 50));

                const blob = processImage(imageData);   // ✅ 이제 정의돼 있음
                console.log(`Blob ${index + 1}:`, blob.size, "bytes");

                const fileName = `image${index + 1}.${imageData.split('/')[1].split(';')[0]}`;
                formData.append("images", blob, fileName);
            }
        });

        const thumbnailFile = document.getElementById('thumbnail')?.files[0];
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        $.ajax({
            url: `/noticeManagement/update/${noticeId}`,
            method: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function () {
                alert("The notice has been successfully updated.");
                window.location.href = "/noticeManagement/noticeManagement";
            },
            error: function () {
                alert("Failed to update the notice.");
            }
        });
    });

    $("#deleteBtn").on("click", function () {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        $.ajax({
            url: `/noticeManagement/delete/${noticeId}`,
            method: "DELETE",
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function () {
                alert("The notice has been deleted.");
                window.location.href = "/noticeManagement/noticeManagement";
            },
            error: function () {
                alert("Failed to delete the notice.");
            }
        });
    });
});