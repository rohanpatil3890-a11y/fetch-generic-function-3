
const cl = console.log;

const postContainer = document.getElementById("postContainer");
const formId = document.getElementById("formId");
const TitleControl = document.getElementById("Title");
const ContentControl = document.getElementById("Content");
const userIdControl = document.getElementById("userId");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const loder = document.getElementById("loder");


function snackbar(title, icon) {
    Swal.fire({
        title,
        icon,
        timer: 2000
    })
}


function blogObjToArr(obj) {

    let arr = [];
    for (const key in obj) {
        obj[key].id = key
        arr.unshift(obj[key])
    }
    return arr
}



let BASE_URL = 'https://xhr-crud-929ee-default-rtdb.firebaseio.com';

let POST_URL = `${BASE_URL}/blogs.json`;

const makeApiCall = (URL, method, body) => {

    loder.classList.remove("d-none");
    body = body ? JSON.stringify(body) : null;

    let obj = {
        method: method,
        body: body,
        headers: {
            "auth": "Token From Ls",
            "content-type": "application/json"
        }


    }

    return fetch(URL, obj)
        .then(res => {
            return res.json().then(data => {
                if (!res.ok) {
                    let err = data.error || res.statusText || "Something went wrong"
                    throw new Error(err)
                }

                return data
            })


        })
        .finally(() => {
            loder.classList.add("d-none");
        })
}

const fetchAllData = () => {
    makeApiCall(POST_URL, "GET", null)
        .then(data => {
            let blogArr = blogObjToArr(data);
            creatCard(blogArr)
        })
        .catch(err => {
            snackbar(err, "error")
        })
}

fetchAllData()

const creatCard = (arr) => {
    let result = "";
    arr.forEach(blog => {
        result += `
                  <div class="card mb-3" id="${blog.id}">
                    <div class="card-header">
                        <h3>${blog.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>
                        ${blog.content}
                            </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick ="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
                </div>
        `;
        postContainer.innerHTML = result;
    })
}

const onsubmitEvent = (eve) => {
    eve.preventDefault();

    let OBJ = {
        title: TitleControl.value,
        content: ContentControl.value,
        userId: userIdControl.value
    }
    cl(OBJ)

    makeApiCall(POST_URL, "POST", OBJ)
        .then(data => {
            creatNewCard(OBJ, data.name)
            cl(data)

        })
        .catch(err => {
            snackbar(err, "error")
        })


}


const creatNewCard = (obj, id) => {
    let card = document.createElement("div");
    cl(card)
    card.id = id;
    cl(card.id)
    card.className = "card mb-3"
    card.innerHTML = `
                 <div class="card-header">
                        <h3>${obj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>
                        ${obj.content}
                            </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick ="onEdit(this)" >Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
    `;
    postContainer.prepend(card);
    snackbar(" New Blog Created Successfully!!!", "success");
}



const onRemove = (ele) => {



    Swal.fire({
        title: "Do you want to remove the Blog?",
        showCancelButton: true,
        confirmButtonText: "Remove",
        denyButtonText: `Remove`,
        confirmButtonColor: "#e03131"
    }).then((result) => {
        if (result.isConfirmed) {


            let REMOVE_id = ele.closest(".card").id;

            let REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_id}.json`;

            makeApiCall(REMOVE_URL, "DELETE", REMOVE_id)
                .then(data => [
                    ele.closest(".card").remove()
                ])
                .catch(err => {
                    snackbar(err, "error")
                })

        }



    });


}

const onEdit = (ele) => {
    let EDIT_ID = ele.closest(".card").id;

    localStorage.setItem("EDIT_ID", EDIT_ID)

    let EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`;


    makeApiCall(EDIT_URL, "GET", null)
        .then(data => {
            TitleControl.value = data.title;
            ContentControl.value = data.content;
            userIdControl.value = data.userId;

            updateBtn.classList.remove("d-none");
            submitBtn.classList.add("d-none")
        })
        .catch(err => {
            snackbar(err, "error")
        })
}

const onupdateEvent = (ele) => {
    let UPDATE_ID = localStorage.getItem("EDIT_ID");

    let UPDATE_URL = `${BASE_URL}/blogs/${UPDATE_ID}.json`;

    let UPDATE_OBJ = {
        title: TitleControl.value,
        content: ContentControl.value,
        userId: userIdControl.value,
        id: UPDATE_ID
    }

    makeApiCall(UPDATE_URL, "PATCH", UPDATE_OBJ)
        .then(data => {
            let card = document.getElementById(UPDATE_ID)
            card.querySelector("h3").innerText = UPDATE_OBJ.title;
            card.querySelector("p").innerText = UPDATE_OBJ.content;

            updateBtn.classList.add("d-none");
            submitBtn.classList.remove("d-none");
            formId.reset();
             snackbar("Blog Updated Successfully!!!", "success");
        })

}
updateBtn.addEventListener("click", onupdateEvent)
formId.addEventListener("submit", onsubmitEvent)