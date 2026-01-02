$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');

    $.ajax({
        type: 'GET',
        url: `/systemManagement/reportDetail/list/${reportId}`,
        dataType: 'json',
        success: function (data) {
            let tbody = $('#mailingDetailTable');
            tbody.empty();

            if (Array.isArray(data) && data.length > 0) {
                data.forEach((item, index) => {
                    tbody.append(`
                        <tr data-partner-id="${item.id}">
                            <td>${data.length - index}</td>
                            <td>${item.userId}</td>
                            <td>${item.email}</td>
                        </tr>
                    `);
                });
            } else {
                tbody.append('<tr><td colspan="7">No User available.</td></tr>');
            }
        },
        error: function (err) {
            console.error('AJAX Error:', err);
        }
    });

    // get Mailing Content
    $.ajax({
        url: `/systemManagement/reportDetail/content/${reportId}`,
        method: 'GET',
        success: function(res) {
            // 데이터 수집 주기가 있을 경우 period input 공개
            if (res.mailingCycle > 0) {
                $('#period').val(res.mailingCycle);
            } else {
                $('span.text-danger.ms-1').hide();
                $('button[type="submit"]').hide();
                $('#periodText').text("none");
            }
            $('#mailingSender').text(res.mailingSender);
            if (res.htmlContent !== '') {
                $('#statistics-container').html(res.htmlContent);
            }

            const date = moment(res.sentAt).format('YYYY-MM-DD HH:mm:ss')
            $('#last-sent-date').text(date);
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });

    // update Mailing
    $("form").on("submit", function(e) {
        e.preventDefault();

        const updateData = {
            mailingCycle: Number($("#period").val())
        };

        $.ajax({
            url: `/systemManagement/reportDetail/update/${reportId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updateData),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader(header, token);
            },
            success: function (res){
                if (res) window.location.href = `/systemManagement/reportDetail?mode=report&reportId=${reportId}`;
            },
            error: function (xhr, status, error) {
                console.log("Error Message:", error);
            }
        });
    })
});