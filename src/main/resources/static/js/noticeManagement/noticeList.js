$(document).ready(function () {

    const noticeContainer = $("#notice-list");

    $.ajax({
        url: "/noticeManagement/noticeList",
        method: "GET",
        success: function (notices) {

            if (!notices || notices.length === 0) {
                noticeContainer.html(`
                    <div class="col-12 text-center text-muted mt-5">
                        📭 No notices found.
                    </div>
                `);
                return;
            }

            notices.forEach(notice => {
                const thumbnail = notice.thumbnailBase64
                    ? notice.thumbnailBase64
                    : "/images/default-thumbnail.png";

                const createdAt = notice.createDate
                    ? notice.createDate.substring(0, 10)
                    : '';

                const card = `
                    <div class="col-lg-4 col-md-6 col-sm-12 mb-3">
                        <div class="card h-100 shadow">

                            <img class="card-img-top" src="${thumbnail}" alt="thumbnail">

                            <div class="card-body">
                                <h5 class="card-title">${notice.title}</h5>
                                <p class="card-text text-muted">${notice.description ?? ""}</p>
                            </div>

                            <div class="card-footer d-flex justify-content-between align-items-center">
                                <small class="text-muted">${createdAt}</small>
                                <a href="/noticeManagement/detail?noticeId=${notice.noticeId}"
                                   class="btn btn-sm btn-primary">
                                    View
                                </a>
                            </div>

                        </div>
                    </div>
                `;

                noticeContainer.append(card);
            });
        },
        error: function () {
            noticeContainer.html(`
                <div class="col-12 text-center text-danger mt-5">
                   Error loading notices.
                </div>
            `);
        }
    });

});