$(document).ready(function() {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    // ajax 초기화
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    // 이벤트 위임 방식으로 변경
    $(document).on('click', '#apiManagementBody .btn-detail', function(e) {
        // 기본 이벤트 방지
        e.preventDefault();

        const isSuperAdmin = $("#isSuperAdmin").val() === 'true';
        const partnerId = $(this).closest('tr').data('partner-id');

        // 유효성 검사 추가
        if (!partnerId) {
            alert('유효한 파트너 ID가 없습니다.');
            return;
        }

        // AJAX 요청 설정
        $.ajax({
            type: 'GET',
            url: `/systemManagement/apiManagement/${partnerId}`,
            dataType: 'json',
            beforeSend: function(xhr) {
                // 로딩 인디케이터 추가
                $('#apiManagementModalBody').html(`
                    <tr>
                        <td colspan="10" class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div> 
                        </td>
                    </tr>
                `);
            },
            success: function (data) {
                const tbody = $('#apiManagementModalBody');
                tbody.empty();

                if (data && data.length > 0) {
                    data.forEach((item, index) => {
                        tbody.append(`
                            <tr data-api-id="${item.id}">
                                <td>${index + 1}</td>
                                <td>${item.apiName || ''}</td>
                                <td>${item.usageLocation || ''}</td>
                                <td>${item.hostName || ''}</td>
                                <td>${item.endPoint || ''}</td>
                                <td>${item.method || ''}</td>
                                <td>${item.apiVersion || ''}</td>
                               <td class="text-center position-relative">
                                    <div class="d-flex flex-column align-items-center">
                                        <span class="badge ${(!item.status || !item.scheduled) ? 'bg-danger' : 'bg-success'}" 
                                              style="padding: 5px; border-radius: 50%; display: inline-block; margin-bottom: 5px;">
                                        </span>
                                        <span class="text-center">${item.scheduledInfo || ''}</span>
                                    </div>
                                </td>
                                <td>
                                ${item.status === false
                                ? `Denied at ${moment(item.lastUpdated).format('YYYY-MM-DD H:mm:ss')}`
                                : (item.lastUpdated ? moment(item.lastUpdated).format('YYYY-MM-DD H:mm:ss') : "")}
                                </td>
                                <td>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" 
                                               id="flexSwitchCheckDefault${item.apiName}"
                                               ${item.status ? 'checked' : ''}>
                                    </div>
                                </td>
                                ${isSuperAdmin === true ? `
                                <td>
                                    <span class='remove'><i class='fa fa-trash' style='font-size: 1.5em;'></i></span>
                                </td>
                                ` : ''}
                            </tr>
                        `);
                    });

                    // Edit 버튼
                    tbody.find('.form-check-input').on('change', function () {
                        const $editButton = $(this);
                        const apiId = $(this).closest('tr').data('api-id');
                        const modalUrl = $editButton.data('url');
                        const $checkbox = $editButton.closest('tr').find('.form-check-input');
                        const currentStatus = $checkbox.is(':checked');
                        const previousStatus = !currentStatus; // 이전 상태 저장

                        if (confirm('Do you want to change the status of this API?')) {
                            $.ajax({
                                type: 'PATCH',
                                url: `/systemManagement/apiManagement/${apiId}`,
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    apiStatus: currentStatus,
                                    scheduleStatus: currentStatus
                                }),
                                xhrFields: {
                                    withCredentials: true
                                },
                                beforeSend: function(xhr){
                                    xhr.setRequestHeader(header, token);
                                },
                                success: function(response) {
                                    $checkbox.prop('checked', currentStatus);

                                    alert('API status has been successfully updated.');
                                    window.location.reload();

                                },
                                error: function(xhr, status, error) {
                                    console.error('API status update failed', error);

                                    $checkbox.prop('checked', !currentStatus);

                                    alert('An error occurred while changing the status.');
                                }
                            });
                        } else {
                            $checkbox.prop('checked', previousStatus); // 변경을 취소했을 때 이전 상태로 복구
                        }
                    });

                    // Remove 버튼
                    tbody.find('.remove').on('click', function () {
                        const apiId = $(this).closest('tr').data('api-id');

                        if (confirm('Do you want to delete this API?')) {
                            $.ajax({
                                type: 'DELETE',
                                url: `/systemManagement/apiManagement/delete/${apiId}`,
                                contentType: 'application/json',
                                success: function (response) {
                                    alert('API has been successfully deleted.');
                                    window.location.reload();
                                },
                                error: function (xhr, status, error) {
                                    console.error('API delete failed', error);
                                }
                            })
                        }
                    });

                } else {
                    tbody.html(`
                        <tr>
                            <td colspan="10" class="text-center text-muted">
                                No API information found for this partner.
                            </td>
                        </tr>
                    `);
                }
            },
            error: function (xhr, status, error) {
                console.error('Data loading error:', {
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });

                $('#apiManagementModalBody').html(`
                    <tr>
                        <td colspan="10" class="text-center text-danger">
                            An error occurred while loading data.
                            <br>
                            Status: ${status}, Error: ${error}
                            <br>
                            Response: ${xhr.responseText}
                        </td>
                    </tr>
                `);
            }
        });
    });
});