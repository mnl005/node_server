document.addEventListener('DOMContentLoaded', function () {
    // get 요청
    function get(el){
            window.location.href = el.dataset.url;
    }
    // 요청 함수
    async function send(el) {
        // 보낼 데이터
        const json = {};
        // 요청 url
        json.url = el.dataset.url;

        // 이벤트 처리 ----------------------------------------------------------------
        switch (json.url){
            case "/text" :
                console.log("테스트 요청을 보냅니다 ...");
            break;
            default:
                console.log("요청전 이벤트 없음");
                break;
        }


        // 요청 보내기 ----------------------------------------------------------------
        // 클릭한 요소가 폼이라면
        if (el.closest('form')) {
            // 버튼값 추출
            json["btn"] = el.value;
            // 폼에서 데이터 추출해서 json형태로 변환
            const form = new FormData(el.closest('form'));

            if (form.has('images')) {
                const imageFiles = form.getAll('images'); // 'images' 키의 모든 파일을 배열로 수집
                json.images = await toBase64(imageFiles); // Base64로 변환된 문자열 저장
                // console.log(json.images.split("~~~~").length); // 변환된 이미지 개수 출력
            }

            // 다른 폼 데이터 처리
            for (const [key, value] of form.entries()) {
                if (key !== 'images') {  // images 키는 이미 처리했으므로 제외
                    json[key] = value;
                }
            }

        }
        // 클릭한 요소가 폼이 아니라면
        else {
            // 버튼에서 value 추출
            json.value = el.value;

        }

        let response;
        try {
            console.log("요청 : ", json);
             response = await axios.post(
                json.url,
                JSON.stringify(json),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('응답:', response.data);
            showMessage(response.data.message,"cadetblue");

            // 응답 후 이벤트 ----------------------------------------------------------------

            // 테스트
            switch (json.url){
                case "/text" :
                    console.log("테스트 완료...");
                    break;
                default:
                    console.log("요청후 이벤트 없음");
                    break;
            }

        } catch (error) {
            showMessage(error.response.data.message,"red");

        }
    }

// 함수 ----------------------------------------------------------------------------------------------------------------

    // 이미지를 문자열로
    async function toBase64(file) {
        if (Array.isArray(file)) {
            // 여러 파일을 변환한 후, ~~~~로 구분하여 결합
            const base64Strings = await Promise.all(file.map(singleFile => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(singleFile);
                    reader.onload = () => resolve(reader.result.split(',')[1]); // Base64 부분만 추출
                    reader.onerror = error => reject(error);
                });
            }));
            return base64Strings.join('~~~~'); // ~~~~로 구분하여 하나의 문자열로 결합
        } else {
            // 단일 파일을 변환
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]); // Base64 부분만 추출
                reader.onerror = error => reject(error);
            });
        }
    }

    // 문자열을 이미지로
    function toImages(target, base64String) {

        const images = base64String.split("~~~~");
        const target_box = document.querySelector(target);

        if(target_box.querySelector('.image_box') !== null){
            const clone_image_box = target_box.querySelector(".image_box").cloneNode(false);
            const clone_image = target_box.querySelector(".image_box").querySelector(".image").cloneNode(true);
            images.forEach((image) => {
                clone_image.innerHTML = "";
                clone_image.style.backgroundImage = `url("data:image/png;base64,${image}")`;
                clone_image_box.appendChild(clone_image);
            });
            return clone_image_box;
        }
        else{
            target_box.querySelector(".image").innerHTML = "";
            const clone_image = target_box.querySelector(".image").cloneNode(true);
            clone_image.style.backgroundImage = `url("data:image/png;base64,${images.get[0]}")`;
            return clone_image;
        }
    }


    // 메시지
    let messageTimeout; // 기존 타이머를 저장할 변수
    function showMessage(text,color) {
        const messageElement = document.getElementById('message');

        // 기존 타이머가 있으면 초기화하여 새로운 요청에 맞게 반영
        if (messageTimeout) {
            clearTimeout(messageTimeout);
            messageElement.textContent = ''; // 기존 메시지 내용 초기화
        }

        // 새로운 응답 텍스트를 요소에 설정하고 표시
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        messageElement.style.background = color;


        // 5초 후에 메시지를 숨기기
        messageTimeout = setTimeout(() => {
            messageElement.style.display = 'none'; // 요소 숨기기
        }, 5000);
    }

    // 요소 제어
    function toggle(show,close) {

        try{
            if(document.querySelector(show[0]).style.display === "block"){
                show.forEach(selector => {
                    document.querySelector(selector).style.display = "none";
                });
            }
            else{
                show.forEach(selector => {
                    document.querySelector(selector).style.display = "block";
                });
            }
        }catch (e){}



        try{
            close.forEach(selector => {
                document.querySelector(selector).style.display = "none";
            });
        }catch (e){}
    }



// html에 함수 적용 ------------------------------------------------------------------------------------------------------------
    window.send = send;
    window.toggle = toggle;
    window.get = get;
});
