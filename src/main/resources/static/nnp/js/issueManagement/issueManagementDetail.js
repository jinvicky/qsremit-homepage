$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    let originalData = {};

    // Quill 에디터 초기화
    const quill = new Quill('#issueEditor', {
        theme: 'snow',
        placeholder: 'Enter the issue details here...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    quill.on('text-change', function () {
        const html = quill.root.innerHTML.trim();
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

        const cleanContent = html === '<p><br></p>' ? '' : processedContent;

        document.getElementById('hiddenContent').value = cleanContent;
        document.getElementById('hiddenImageData').value = JSON.stringify(imageDataList);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get("issueId");

    if (issueId) {
        $.ajax({
            url: `/issueManagement/issueDetail/${issueId}`,
            method: "GET",
            success: function (issue) {
                const priorityVal = toEnumStyle(issue.priority);
                const categoryVal = toEnumStyle(issue.category);
                const typeVal = toEnumStyle(issue.type);
                const statusVal = toEnumStyle(issue.status);
                const assigneeVal = issue.assignee;

                originalData = {
                    title: issue.title,
                    priority: priorityVal,
                    category: categoryVal,
                    type: typeVal,
                    status: statusVal,
                    assignee: assigneeVal,
                    description: issue.description
                };

                $("#title").val(unescapeSpecialCharacters(issue.title));

                $("#prioritySelect option").each(function () {
                    if ($(this).val() === unescapeSpecialCharacters(priorityVal)) {
                        $(this).prop("selected", true);
                    }
                });

                $("#categorySelect option").each(function () {
                    if ($(this).val() === unescapeSpecialCharacters(categoryVal)) {
                        $(this).prop("selected", true);
                    }
                });

                $("#typeSelect option").each(function () {
                    if ($(this).val() === unescapeSpecialCharacters(typeVal)) {
                        $(this).prop("selected", true);
                    }
                });

                $("#statusSelect option").each(function () {
                    if ($(this).val() === unescapeSpecialCharacters(statusVal)) {
                        $(this).prop("selected", true);
                    }
                });

                $("#assigneeSelect option").each(function () {
                    if ($(this).val() === unescapeSpecialCharacters(assigneeVal)) {
                        $(this).prop("selected", true);
                    }
                });

                $("#writer").html(issue.user);
                $("#statusBadge").html(issue.status);

                quill.root.innerHTML = issue.description ? issue.description.replace(/\\n/g, '<br>') : '';

                $("#hiddenContent").val(unescapeSpecialCharacters(issue.description === '<p><br></p>' ? '' : issue.description));

                if (issue.file) {
                    $("#fileLink").attr("href", `/files/${issue.file}`);
                    $("#fileSection").show();
                }

                $(quill.root).find('img').each(function () {
                    $(this)
                        .addClass('issue-image')
                        .attr('data-bs-toggle', 'modal')
                        .attr('data-bs-target', '#issueImageViewer');
                });
            },
            error: function () {
                alert("이슈 상세 정보를 불러오지 못했습니다.");
            }
        });
    }

    $(document).on('click', '.issue-image', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const imgSrc = $(this).attr('src');
        $('#modalImage').attr('src', imgSrc);
        $('#issueImageViewer').modal('show');
    });


    function toEnumStyle(value) {
        if (value.includes("Management")) {
            value = value.replace("Management", "");
        }
        if (value.includes("History")) {
            value = value.replace("History", "");
        }
        if (value.includes("Report")) {
            value = value.replace("Report", "");
        }
        return value.trim().toUpperCase().replace(/ /g, "_");
    }

    $("form").on("submit", function (e) {
        e.preventDefault();

        const updatedData = {
            title: $("#title").val(),
            priority: $("#prioritySelect").val(),
            category: $("#categorySelect").val(),
            type: $("#typeSelect").val(),
            status: $("#statusSelect").val(),
            assignee: $("#assigneeSelect").val(),
            description: $("#hiddenContent").val()
        };

        const formData = new FormData();
        formData.append("dto", new Blob([JSON.stringify(updatedData)], {type: "application/json"}));

        const imageDataList = JSON.parse($("#hiddenImageData").val() || '[]');
        imageDataList.forEach((imageData, index) => {
            const blob = processImage(imageData, index);
            const fileName = `image${index + 1}.${imageData.split('/')[1].split(';')[0]}`;
            formData.append("images", blob, fileName);
        });

        $.ajax({
            url: `/issueManagement/update/${issueId}`,
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
                alert("The issue has been successfully updated.");
                window.location.href = "/issueManagement/issueManagement";
            },
            error: function () {
                alert("Failed to update the issue.");
            }
        });
    });

    function processImage(imageData, index) {
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
        const byteString = atob(imageData.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeType });
    }

});