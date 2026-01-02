document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.getElementById("noticeDetailWrapper");
    if (!wrapper) return;

    const noticeId = wrapper.dataset.noticeId;
    if (!noticeId) return;

    fetch(`/noticeManagement/noticeDetail/${noticeId}`)
        .then(response => {
            if (!response.ok) throw new Error("네트워크 오류");
            return response.json();
        })
        .then(data => {

            document.getElementById("noticeTitle").innerText = data.title;

            //DB 저장된 html태그 description
            let descHtml = data.description || "";

            //이미지라서 따로 임시공간에 저장
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = descHtml;

            //이미지 src 배열에 맞게 교체
            if (data.images && data.images.length > 0) {

                const imgTags = tempDiv.querySelectorAll('img');

                data.images.forEach((img, index) => {
                    if (imgTags[index]) {
                        imgTags[index].setAttribute('src', img.base64Data);
                    }
                });
            }

            document.getElementById("noticeDescription").innerHTML = tempDiv.innerHTML;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("noticeDescription").innerText =
                "공지 내용을 불러오는 중 오류가 발생했습니다.";
        });
});