$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');
    let isSuperAdmin = false;

    // ajax 초기화
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    // 권한 정보 조회
    $.ajax({
        url: "/user/api/userRole", // 권한 정보를 조회하는 API
        method: "GET",
        success: function (response) {
            isSuperAdmin = response.includes("SUPER_ADMIN");
            if(isSuperAdmin){
                $("#uploadBankListCard").removeClass("d-none");
                $("#buttonContainer").removeClass("d-none");
                $("#isSuperAdmin").val(true);
            }
        },
        error: function (xhr, status, error) {
            console.error("Cannot get user role:", error);
        }
    });

    $("#file").on("change", function () {
        const fileName = $(this).val().split("\\").pop();
        $("#fileName").val(fileName || "Please Upload Bank Code List .xsl file");
    });

    // 파일 업로드
    $("#uploadForm").on("submit", function (event) {
        event.preventDefault();

        const formData = new FormData();
        const file = document.getElementById("file");
        const fileType = document.getElementById("fileType").value;

        if (!file.files[0]) {
            alert("No File Selected");
            return;
        }
        const allowedExtensions = ["xml", "xls", "xlsx", "csv"];
        const fileExtension = file.files[0].name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert("Invalid file type. Only XML, XLS, XLSX, CSV files are allowed.");
            return;
        }
        formData.append("file", file.files[0]);
        formData.append("fileType", fileType);

        $.ajax({
            url: "/systemManagement/apiManagement/upload",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                // 성공 처리
                console.log("File uploaded successfully", response);
                alert("File uploaded successfully!");
            },
            error: function (error) {
                // 에러 처리
                console.error("Error uploading file", error);
                alert("Failed to upload file. Please try again.");
            }
        });
    });

    // 파일 다운로드
    $("#downloadFormButton").on("click", function () {
        if(!isSuperAdmin) return;
        fetch('/systemManagement/apiManagement/excel/download', {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bank_code_upload_form.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch(error => {
                console.error('Error downloading file:', error);
                alert('Error downloading file.');
            });
    })

    $.ajax({
        type: 'GET',
        url: '/systemManagement/apiManagement/',
        dataType: 'json',
        success: function (data) {
            let tbody = $('#apiManagementBody');
            tbody.empty();

            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => {
                    // partner 기준 1차 정렬
                    const partnerA = a.partner || '';
                    const partnerB = b.partner || '';
                    if (partnerA !== partnerB) {
                        return partnerA.localeCompare(partnerB);
                    }
                    // country 기준 2차 정렬
                    const countryA = a.country || '';
                    const countryB = b.country || '';
                    return countryA.localeCompare(countryB);
                });

                const selectElement = document.getElementById("partnerId");

                data.forEach((item, index) => {
                    tbody.append(`
                        <tr data-partner-id="${item.id}">
                            <td class="text-center">${index + 1}</td>
                            <td>${item.partner}</td>
                            <td>${item.systemAdmin}</td>
                            <td class="text-center">
                                <div class="form-check form-switch d-flex justify-content-center">
                                    <input class="form-check-input api-status-toggle" type="checkbox"
                                           id="flexSwitchCheck${item.id}" 
                                           data-partner-id="${item.id}"
                                           ${item.apiStatus ? 'checked' : ''}>
                                </div>
                            </td>
                            <td class="text-center">${item.apiCount}</td>
                            <td class="text-center d-flex justify-content-center">
                                <button type="button"
                                        class="btn btn-primary waves-effect waves-light btn-detail"
                                        data-bs-toggle="modal"
                                        data-bs-target="#con-close-modal">
                                    Detail
                                </button>
                            </td>
                        </tr>
                    `);

                    if(item.partner !== null) {
                        const option = document.createElement("option");
                        option.value = item.id; // 옵션 값 (value)
                        option.textContent = item.partner; // 옵션 텍스트
                        selectElement.appendChild(option); // <select>에 옵션 추가
                    }
                });

                tbody.on('change', '.api-status-toggle', function() {
                    const $this = $(this);
                    const partnerId = $this.data('partner-id');
                    const isChecked = $this.prop('checked');

                    if (confirm(isChecked
                        ? 'Are you sure you want to activate APIs?'
                        : 'Are you sure you want to disable APIs?')) {

                        $.ajax({
                            type: 'PUT',
                            url: '/systemManagement/apiManagement/',
                            contentType: 'application/json',
                            dataType: 'text',
                            data: JSON.stringify({
                                id: partnerId,
                                status: isChecked
                            }),
                            xhrFields: {
                                withCredentials: true
                            },
                            beforeSend: function(xhr){
                                xhr.setRequestHeader(header, token);
                            },
                            success: function(response) {
                                if (response === 'success') {
                                    $('.api-status-toggle[data-partner-id="' + partnerId + '"]').prop('checked', isChecked);
                                    alert(isChecked
                                        ? 'APIs have been activated successfully.'
                                        : 'APIs have been disabled successfully.');
                                } else {
                                    $this.prop('checked', !isChecked);
                                    alert('Unexpected response received.');
                                }
                            },
                            error: function(xhr, status, error) {
                                $this.prop('checked', !isChecked);
                                alert(isChecked
                                    ? 'Failed to activate APIs: ' + (xhr.statusText || 'Unknown error')
                                    : 'Failed to disable APIs: ' + (xhr.statusText || 'Unknown error'));
                            }
                        });
                    } else {
                        $this.prop('checked', !isChecked);
                    }
                });


                tbody.on('click', '.btn-detail', function () {
                    let partnerId = $(this).closest('tr').data('partner-id');

                    $('#con-close-modal').data('isSuperAdmin', isSuperAdmin);
                });

            } else {
                tbody.append('<tr><td colspan="7">No data available.</td></tr>');
            }
        },
        error: function (err) {
            console.error('AJAX 오류:', err);
            alert('An error occurred while loading data: ' + err.statusText);
        }
    });

    document.getElementById("createApiBtn").addEventListener("click", function () {
        if(!isSuperAdmin) return;

        $('#newApiCreate').modal('show');
    });

    document.getElementById("apiForm").addEventListener("submit", function (e) {
        e.preventDefault(); // 기본 제출 동작 방지

        // Form 데이터 가져오기
        const formData = new FormData(apiForm);
        const data = {};
        formData.forEach((value, key) => {
            // 타입 변환 처리
            if (key === "partnerId") {
                data[key] = Number(value); // 숫자로 변환
            } else if (key === "apiStatus" || key === "scheduleStatus") {
                data[key] = value === "true" || value === "on"; // boolean으로 변환
            } else {
                data[key] = value; // 문자열 그대로 사용
            }
        });

        // AJAX POST 요청
        $.ajax({
            url: "/systemManagement/apiManagement/create",
            method: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (response) {
                alert("Api created successfully.");
                $('#newApiCreate').modal('hide');
                document.getElementById("apiForm").reset();
                window.location.reload();
            },
            error: function (xhr, status, error) {
                console.error('API create failed', error);
            }
        });

    })

});