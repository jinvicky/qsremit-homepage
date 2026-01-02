$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    const url = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    let customerId;
    if (url.match(/customerDetail\/([A-Za-z0-9]+)/)) {
        customerId = url.match(/customerDetail\/([A-Za-z0-9]+)/)[1];
    }
    let imagesLoad = false;
    let loadImageCount = 0;

    /* 이미지 컨테이너 생성 */
    class ImageContainer {
        static createImageContainer(src, id, maxWidth, maxHeight) {
            const imageContainer = $(`
            <div class="image-container" style="display: inline-block; position: relative; margin: 5px;">
                <img src="${src}"
                    data-bs-toggle="modal" data-bs-target="#imageViewer"
                    alt="Image Preview"
                    onerror="this.src='/nnp/images/noImage.jpg'"
                    style="max-width: ${maxWidth}px; 
                            max-height: ${maxHeight}px; 
                            border: 1px solid #ddd;
                            border-radius: 4px;"/>
                <button class="remove-image" 
                        data-id="${id}"
                        style="position: absolute;
                            top: 5px;
                            right: 5px;
                            background: black;
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 25px;
                            height: 25px;
                            cursor: pointer;">X</button>
            </div>
        `);

            imageContainer.find('.remove-image').on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this?")) {
                    console.log("Deleted");
                    removeImage(id, imageContainer)
                } else {
                    console.log("Deletion canceled");
                }
            });

            imageContainer.on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if ($(e.target).hasClass('remove-image')) return;

                const imgSrc = imageContainer.find('img').attr('src');
                $('#modalImage').attr('src', imgSrc);
                $('#imageViewer').modal('show');
            })

            return imageContainer;
        }
    }

    function removeImage(id, container) {
        $.ajax({
            url: '/api/id-card/delete?idCardId=' + id,
            type: 'DELETE',
            contentType: false,
            processData: false,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: () => {
                container.remove();
                this.imageCount--;
            },
            error: (xhr, status, error) => {
                console.error('파일 삭제 실패:', error);
                alert('Failed to delete the file');
            }
        });
    }

    /* 생성된 이미지 불러오기 */
    if (customerId && !imagesLoad) {
        $("#loadingSpinner").show()
        $.ajax({
            url: '/api/id-card/load?customerId=' + customerId,
            type: 'GET',
            contentType: false,
            processData: false,
            success: (response) => {
                for (let i = 0; i < response.length; i++) {
                    const imageContainer = ImageContainer.createImageContainer(
                        `${response[i].url}`,
                        response[i].fileName,
                        200, 200
                    );
                    $('#idCardUpload').append(imageContainer);
                    loadImageCount++;
                }
                imagesLoad = true;
            },
            error: (xhr, status, error) => {
                console.error('파일 로드 실패:', error);
                alert('Failed to load images.');
            },
            complete: () => {
                $("#loadingSpinner").hide()
            }
        });
    }

    class ImageUploader {
        constructor(options = {}) {
            this.maxImages = options.maxImages || 10;
            this.imageCount = 0 - loadImageCount;
            this.inputId = options.inputId;
            this.previewId = options.previewId;
            this.maxWidth = options.maxWidth || 200;
            this.maxHeight = options.maxHeight || 200;
            this.onImageAdded = options.onImageAdded || (() => {
            });
            this.onImageRemoved = options.onImageRemoved || (() => {
            });
            this.uploadUrl = '/api/id-card/upload';
            this.init();
        }

        init() {
            $(`#${this.inputId}`).on('change', (e) => this.handleImageUpload(e));
        }

        handleImageUpload(e) {
            const files = e.target.files;

            if (this.imageCount + files.length > this.maxImages) {
                alert(`Only up to ${this.maxImages} images can be uploaded.`);
                return;
            }

            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) {
                    alert('Please select image files only.');
                    return;
                }
                this.uploadToServer(file);
            });

            // 입력 필드 초기화
            $(e.target).val('');
        }

        uploadToServer(file) {
            const formData = new FormData();
            formData.append('file', file);

            /* tempId 재사용 */
            if ($('#tempId').val()) {
                formData.append('tempId', $('#tempId').val());
            }

            $.ajax({
                url: this.uploadUrl,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(header, token);
                },
                success: (response) => {
                    console.log('UPLOAD', response);
                    /* tempId 저장 */
                    $('#tempId').val(response.tempId)

                    /* 이미지 미리보기 */
                    const imageContainer = ImageContainer.createImageContainer(
                        response.filePath, response.fileName,
                        this.maxWidth, this.maxHeight
                    );
                    $(`#${this.previewId}`).append(imageContainer);
                    this.imageCount++;
                },
                error: (xhr, status, error) => {
                    console.error('파일 업로드 실패:', error);
                    alert('File upload failed.');
                }
            });
        }
    }

    // ID Card Uploader
    const idCardUploader = new ImageUploader({
        inputId: 'idCardUploadInput',
        previewId: 'idCardUpload',
        maxImages: 20,
        maxWidth: 200,
        maxHeight: 200,

        onImageAdded: () => {
            console.log('이미지 추가됨');
        },
        onImageRemoved: () => {
            console.log('이미지 제거됨');
        }
    })
})

