var NasaImages = ( () => {
    const APIKEY = "aTKJaxgQ0HPOTrTncpZxz4biFt9f7wg4E0S69LKN";
    let publicData = {}
    let listImages = [];//saves the searched images
    const statusError="some error occurred"
    //------------------------------------------------------------------

    //creates image class with data fields-------------------
    publicData.Image = class Image {
        constructor(earthDate, solDate, imageLink, nameCamera, nameRiver, id) {
            this.earthDate = earthDate;
            this.solDate = solDate;
            this.imageLink = imageLink;
            this.nameCamera = nameCamera;
            this.nameRiver = nameRiver;
            this.id = id;
        }
    }
    //-----------------------------------------------------
    publicData.getSavedImages=function() {
        return fetch('./api/nasaPage/getSavedImages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response)=>{
            if (response.ok)
                return response.json();
            else
                throw new Error('Server response wasn\'t OK');
            })
            .then((json) => {
                if (json.error)
                    document.querySelector("#savedImages").innerHTML = "Some error occurred, is the database initialized?";
                else {
                    return(json);
                }
            }).catch((error)=>{
                console.log(error);
            })
    }
    //prints the saved list on the html----------------------------------------
    publicData.showSavedList= async function(){
        document.getElementById("loading").style.display = "none"
        document.getElementById("list").innerHTML="";
        let node = '';
        let arr = await publicData.getSavedImages().then((data)=>{
            return data;
        });

        for (let i in arr)
        {
            node += "<li><button type='button' id='deleteLine' name="+arr[i].url+" class='btn-danger'>X</button><a href=" +arr[i].url + " target='_blank'> image id: " + arr[i].imageId + "</a>";
            node += "<br><span id="+arr[i].earthDate+">Earth_date: " + arr[i].earthDate + "</span><span id=" +arr[i].sol+"> ,Sol: "+arr[i].sol+ "</span><span id="+arr[i].camera+"> ,Camera: ";
            node += arr[i].camera+ "</span></li>";
        }
        document.getElementById("list").innerHTML = node;

        publicData.addImagesListener();
    }

    //date validator--------------------------------------------------------------
    publicData.validateDate = function () {
        let date_regex = /^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/;
        let sol_regex = /^-?\d{1,4}$/;
        let testDate = document.getElementById("textbox")
        if (date_regex.test(testDate.value)) {
            document.getElementById("message").hidden = true;
            testDate.style.borderColor = 'silver';
            return 'earth_date';
        } else if (sol_regex.test(testDate.value)) {
            document.getElementById("message").hidden = true;
            testDate.style.borderColor = 'silver';
            return 'sol';
        } else {
            document.getElementById("message").hidden = false;
            if (testDate.value === "" || testDate.value.trim().length === 0) {
                testDate.style.borderColor = 'red';
                document.getElementById("message").innerHTML = "input is required here";
            } else {
                testDate.style.borderColor = 'red';
                document.getElementById("message").innerHTML = "please enter a SOL number or a valid date";
            }
        }
        return 'none';
    }

    //close the modal of duplicated image save window----------------------
    publicData.removeModal = function () {
        // find the modal and remove if it exists
        const modal = document.querySelector('dialog')
        if (modal) {
            modal.remove()
        }
    }

    //show loading gif and call main validator------------------------------
    publicData.setLoadingScreen = function () {
        document.getElementById('no_result').innerText = '';
        document.getElementById("loading").style.display = "block";
        publicData.mainValidator();
        listImages = []; //delete the images array to not have a huge array
    }

    //hide loading gif---------------------------------
    publicData.unsetLoadingScreen = function () {
        document.getElementById("loading").style.display = "none";
    }

    //function that calls all the other validators and calls the search images---
    publicData.mainValidator = function () {
        let save = publicData.validateDate()
        let missionDate = publicData.validateMission(save);
        if (publicData.validateCheckEmptyFields() && (save === 'earth_date') && missionDate) {
            publicData.searchImages('earth_date');
        } else if (publicData.validateCheckEmptyFields() && (save === 'sol') && missionDate) {
            publicData.searchImages('sol');
        } else
            publicData.unsetLoadingScreen();
    }

    //clear fields--------------------------------
    publicData.clearOption = function () {
        document.getElementById("form").reset();
        document.getElementById('data').innerHTML = '';
        document.getElementById("message").hidden = true;
        document.getElementById("messageCamera").hidden = true;
        document.getElementById("messageRover").hidden = true;
        document.getElementById("textbox").style.borderColor = 'silver';
        document.getElementById("dropdown").style.borderColor = 'silver';
        document.getElementById("dropdownCamera").style.borderColor = 'silver';
    }

    //create error window when the same image is saved twice-------
    publicData.createModal = function () {
        let myDialog = document.createElement("dialog");
        myDialog.classList.add("dialog");
        document.body.appendChild(myDialog)
        let text = document.createElement("p");
        text.innerText = "This image is already saved!";
        myDialog.appendChild(text);
        let close = document.createElement("BUTTON");
        close.classList.add("btn");
        close.classList.add("btn-secondary");
        close.id = "close";
        close.type = "button";
        close.innerText = "Close";
        myDialog.appendChild(close);
        myDialog.showModal();
        //add listener
        close.addEventListener('click', event => {
            if (event.target.id === 'close') {
                publicData.removeModal();
            }
        })
    }

    //save image to the saved images----------------------
    publicData.saveImg = function (event) {
        let ind,node='';
        let idOfImg = event.target.parentElement.children[0].id;
        for (let i = 0; i < listImages.length; i++)
            if (listImages[i].id === idOfImg)
                ind = i;

        document.getElementById('url').value = listImages[ind].imageLink;
        document.getElementById('sol').value = listImages[ind].solDate;
        document.getElementById('Earth_date').value = listImages[ind].earthDate;
        document.getElementById('camera').value = listImages[ind].nameCamera;
        document.getElementById('imageId').value = listImages[ind].id;

        fetch('./api/nasaPage/saveImage', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listImages[ind]),
        }).then(function(response){

            if(response.status === 404)
                window.location.replace('/');
            if(response.status !== 200) {
                publicData.createModal();
            }
            else{
               node += "<li><button id='deleteLine' name="+listImages[ind].imageLink+" class='btn-danger'>X</button><a href=" + listImages[ind].imageLink + " target='_blank'> image id: " + listImages[ind].id + "</a>";
                node += "<br><span id="+listImages[ind].earthDate+">Earth_date: " + listImages[ind].earthDate + "</span><span id=" +listImages[ind].solDate+"> ,Sol: " + listImages[ind].solDate + "</span><span id="+listImages[ind].nameCamera+"> ,Camera: ";
                node += listImages[ind].nameCamera+ "</p></li>";
                document.querySelector("#list").innerHTML += node;
                publicData.showSavedList();
            }
        }).catch((err)=>{
            console.log(err);
        });
    }

    //When the user clicks on full size-----------------------------------
    publicData.fullSize = function (event) {
        let srcImg = event.target.parentElement.children[0].src;
        window.open(srcImg);
    }

    //open image in full size from carousel view----------------------
    publicData.fullSizeSliderHandler = function (event) {
        let srcImg = event.target.parentElement.parentElement.children[0].src;
        window.open(srcImg);
    }

    //empty fields validator-------------------
    publicData.validateCheckEmptyFields = function () {
        let valid = true;
        let saveSelect = document.getElementById("dropdown")
        let saveSelectCamera = document.getElementById("dropdownCamera")
        const roverName = saveSelect.options[saveSelect.selectedIndex].value
        const camera = saveSelectCamera.options[saveSelectCamera.selectedIndex].value;

        if (roverName === "Choose a rover") {
            let roverErr = document.getElementById("messageRover");
            roverErr.hidden = false;
            roverErr.innerHTML = "input is required here";
            valid = false;
            saveSelect.style.borderColor = 'red';
        } else {
            document.getElementById("messageRover").hidden = true;
            saveSelect.style.borderColor = 'silver';
        }
        if (camera === "Choose a camera") {
            let cameraErr = document.getElementById("messageCamera");
            cameraErr.hidden = false;
            cameraErr.innerHTML = "input is required here";
            valid = false;
            saveSelectCamera.style.borderColor = 'red';
        } else {
            document.getElementById("messageCamera").hidden = true;
            saveSelectCamera.style.borderColor = 'silver';
        }
        return valid;
    }

    //button of carousel----------
    publicData.buttonCarousel = function () {
        return '</div><button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">' +
            '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
            '<span class="visually-hidden">Previous</span>' +
            '</a>' +
            '<button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">'+
            '<span class="carousel-control-next-icon" aria-hidden="true"></span>'+
            '<span class="visually-hidden">Next</span>'+
            '</button>'+
            '</div>';
    }


    //create Carousel of images-------------------
    publicData.doSlide = async function () {
        document.getElementById("slidePart").hidden = false;
        let SlideStr = "";
        let arr = await publicData.getSavedImages().then((data)=>{
            return data;
        }).catch(error=>error);
        if(arr.length===0)//if no saved images
            return
        SlideStr =
            '<div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel">'+
            '<div class="carousel-indicators">'+
            '<button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" class="active" ' +
            'aria-current="true" aria-label="Slide 1"></button>';

        for (let i = 1; i < arr.length ; i++) {
            SlideStr += '<button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="' + i + '" aria-label="Slide '
                + i +'"></button>'
        }

        SlideStr += '  </div>\n' +
            '  <div class="carousel-inner">\n' +
            '    <div class="carousel-item active">\n' +
            "      <img src='" + arr[0].url + "' class='d-block w-100' alt='image'>\n" +
            '     <div class="carousel-caption d-none d-md-block">\n' +
            '       <h5>' + arr[0].camera + '</h5>\n' +
            '       <p>' + arr[0].earthDate + '</p>\n' +
            "       <button type='button' id='fullSizeSlider' class='btn btn-primary' style='margin: 5px;'>Full Size</button>" +
            '      </div></div>\n'

        for (let index = 1; index < arr.length; index++) {
            SlideStr += '<div class="carousel-item">\n' +
                "           <img src='" + arr[index].url + "' class='d-block  w-100' alt='image'>\n" +
                '           <div class="carousel-caption d-none d-md-block">' +
                '               <h5>' + arr[index].camera + '</h5>\n' +
                '               <p>' + arr[index].earthDate + '</p>' +
                "           <button type='button' id='fullSizeSlider' class='btn btn-primary' style='margin: 5px;'>Full Size</button>" +
                '           </div></div>'
        }
        SlideStr += publicData.buttonCarousel();
        document.getElementById("slidePart").innerHTML = SlideStr;
        publicData.addImagesListener();
    }

    //remove slide-------------------------------------------------------------------
    publicData.doStopSlide = function () {
        document.getElementById("slidePart").hidden = true;
    }

    //error page------------------------------------------------------------
    publicData.status = function (response) {

        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    //create cards of images with data----------
    publicData.createDiv = function (index, result) {
        listImages.push(new publicData.Image(result.photos[index].earth_date.toString(), result.photos[index].sol.toString(),
            result.photos[index].img_src.toString(),
            result.photos[index].camera.name.toString(), result.photos[index].rover.name.toString(),
            result.photos[index].id.toString()))
        let ind = listImages.length - 1;

        return "<div class='col-sm-4 mt-3'  id='buttons'>" +
            "<div class='card'>" +
            "<div class='card-body' style='width: 20rem;'>" +
            "<img class='card-img-top'  src='" + (listImages[ind].imageLink) + "' id='" +
            listImages[ind].id + "' alt='img' > " +
            "<div id='earthData'><p >Earth date: " + listImages[ind].earthDate + "</p></div>" +
            "<p>Sol: " + listImages[ind].solDate +
            "</p><p>Camera: " + (listImages[ind].nameCamera) + "</p><p>Mission: " +
            (listImages[ind].nameRiver) + "</p><button class='submit btn btn-outline-primary' id='sImage' class='btn btn-info' style='margin: 5px;'>Save</button>" +
            "<button type='button' id='fullScreen' class='btn btn-primary' style='margin: 5px;'>Full Size</button>" +
            "</div></div></div>";
    }
//deletes all the saved images-------------------------------------------------
    publicData.deleteListImages = function (event) {
        let ind;
        let idOfImg = event.target.parentElement.children[1].id;
        for (let i = 0; i < listImages.length; i++)
            if (listImages[i].id === idOfImg) {
                ind = i;
                break;
            }

        fetch('./api/nasaPage/deleteImages', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listImages[ind])
        }).then(response => {
            if (response.status === 404) {
                window.location.replace('/');
            }
            if (response.status !== 200) {
                throw Error(statusError)
            }
            publicData.showSavedList();

        }).catch((error) => {
            console.log(error);
        });
    }
    //deletes selected saved image---------------------------------------
    publicData.deleteSavedImage = function (event) {
        let path=event.target.parentElement;

        fetch('./api/nasaPage/deleteSavedImage', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
            },
            body: JSON.stringify({url: path.children[0].name})
        }).then(response=>{
            if(response.status === 404)
            {
                window.location.replace('/');
            }
            if(response.status !== 200) {
                throw Error(statusError)
            }
            publicData.showSavedList();

        }).catch((error) => {
            console.log(error);
        });
    }

    //validate mission date---------
    publicData.validateMission = function (date_format){
        const saveSelect = document.getElementById("dropdown");
        const roverName = saveSelect.options[saveSelect.selectedIndex].value;
        const date = document.getElementById("textbox").value.trim();
        if(date==='' || roverName === "Choose a rover")
            return;

        fetch('https://api.nasa.gov/mars-photos/api/v1/manifests/' + roverName.toString() + '?api_key=' +APIKEY)
            .then(publicData.status)
            .then(res => res.json())
            .then(result => {
                if (date_format === 'earth_date') {

                    if (date.toString() > result.photo_manifest.max_date) {
                        throw new Error("the mission you've selected requires a date before " + result.photo_manifest.max_date);
                    } else if (date.toString() < result.photo_manifest.landing_date) {
                        throw new Error("the mission you've selected requires a date after " + result.photo_manifest.landing_date);
                    }
                }
                else {
                    if (date.toString() > result.photo_manifest.max_sol) {
                        throw new Error("the max sol for this mission is " + result.photo_manifest.max_sol);
                    } else if (date.valueOf() < 0) {
                        throw new Error("sol cannot be less than 0");
                    }
                }
            })
            .catch(function (err) {
                document.getElementById("message").hidden=false;
                document.getElementById("message").innerText = err;
                return false;
            }).finally(function () {
            document.getElementById("loading").style.display = "none";
        });
        return true;
    }

    //button of search images-------------------------------
    publicData.searchImages = function (date_format) {

        let date = document.getElementById("textbox").value.trim();
        let data = document.getElementById("data")
        let saveSelect = document.getElementById("dropdown")
        let saveSelectCamera = document.getElementById("dropdownCamera")
        const roverName = saveSelect.options[saveSelect.selectedIndex].value
        const camera = saveSelectCamera.options[saveSelectCamera.selectedIndex].value;

        fetch('https://api.nasa.gov/mars-photos/api/v1/rovers/' + roverName.toString()
            + '/photos?' + date_format + '=' + date.toString() + '&camera=' + camera.toString() + '&api_key=' +APIKEY)

            .then(publicData.status)
            .then(res => res.json())
            .then(result => {
                let mainDiv = document.createElement("div");
                mainDiv.innerHTML = '';
                for (let index = 0; index < Object.keys(result.photos).length; index++)
                    mainDiv.innerHTML += publicData.createDiv(index, result);

                data.innerHTML = mainDiv.innerHTML;
                publicData.addImagesListener();
                if(data.innerHTML === '') {
                    document.getElementById("no_result").innerHTML = "No images found"
                }
                else
                    document.getElementById("no_result").innerHTML = '';

            })
            .catch(function (err) {
                document.getElementById("message").hidden=false;
                document.getElementById("message").innerText = err;
            }).finally(function () {
            document.getElementById("loading").style.display = "none";
        });
    }

    //add listeners to images---------------------
    publicData.addImagesListener=function(){
        document.querySelectorAll("#sImage").forEach(saveI => {
            saveI.addEventListener('click', NasaImages.saveImg);
        });

        document.querySelectorAll("#fullScreen").forEach(btnFullScreen => {
            btnFullScreen.addEventListener('click', NasaImages.fullSize);
        });

        document.querySelectorAll("#deleteLine").forEach(btnDeleteImages => {
            btnDeleteImages.addEventListener('click', NasaImages.deleteSavedImage);
        });

        document.querySelectorAll("#fullSizeSlider").forEach(btnFullScreen => {
            btnFullScreen.addEventListener('click', NasaImages.fullSizeSliderHandler);
        });

    }
    return publicData;
})();

//--------------------------listener-----------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    NasaImages.showSavedList();

    document.getElementById("searchForm").addEventListener("click",(event)=>{
        event.preventDefault();
        NasaImages.setLoadingScreen();
    });

    document.getElementById("clear").addEventListener("click", NasaImages.clearOption);
    document.getElementById("startSlide").addEventListener("click", NasaImages.doSlide);
    document.getElementById("stopSlide").addEventListener("click", NasaImages.doStopSlide);
    document.getElementById("deleteImg").addEventListener("click", NasaImages.deleteListImages);

});