const apiKey = "3ea37d87050c9b78f1465b90f9d3d261";

const model = {
    movies: [],
    likedMovies: [],
    selectedMovie: [],
    pageNum: 0,
    totalPages: 0,
    filter: "popular",
    tab: "home",
    imageBaseURI: "",
    imageSize: "",
    apiBaseURI: "https://api.themoviedb.org/3"
};

const fetchConfig = () => {
    const URI = `${model.apiBaseURI}/configuration?api_key=${apiKey}`;
    return fetch(URI).then((resp) => resp.json());
};

const fetchMoviesAPI = (filter, pageNum) => {
    const URI = `${model.apiBaseURI}/movie/${filter}?api_key=${apiKey}&language=en-US&page=${pageNum}&region=US`;
    return fetch(URI).then((resp) => resp.json());
}

const createMovieCard = (movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.id = movie.id;

    const likedMoviesID = model.likedMovies.map((movie) => {
        return movie.id;
    });

    const imagePath = `${model.imageBaseURI}${model.imageSize}${movie.poster_path}`
    const htmlTemplate = `
        <img src="${imagePath}"/>
        <div class="movie-card-text-area">
            <p>${movie.title}</p>
            <div class="movie-footer">
            <div class="ratings">
                <i class="ion-star"></i>
                <span>${movie.vote_average}</span>
            </div>
            <div class="like-button${likedMoviesID.includes(movie.id) ? " liked" : ""}">
                <i class="ion-ios-heart-outline"></i>
                <i class="ion-ios-heart"></i>
            </div>
            </div>
        </div>
    `
    movieCard.innerHTML = htmlTemplate;
    return movieCard;
};

const updatePageBanner = () => {
    const pageBanner = document.querySelector(".page-banner");

    if (model.tab === "liked_list") {
        pageBanner.innerHTML = "";
    } else {
        const showClass = "class=\"show\"";
        const htmlTemplate = `
            <button ${model.pageNum === 1 ? "" : showClass}id="prev-button">prev</button>
            <p class="page-text">${model.pageNum}/${model.totalPages}</p>
            <button ${model.pageNum === model.totalPages ? "" : showClass} id="next-button">next</button>
        `
        pageBanner.innerHTML = htmlTemplate;
    }
}

const updateView = () => {
    updatePageBanner();
    const movieList = document.querySelector(".movies");
    movieList.innerHTML = "";

    if (model.tab === "home") {
        model.movies.forEach((movie) => {
            const movieCard = createMovieCard(movie);
            // const gridItem = document.createElement("div");
            // gridItem.className = "movie-card-container";
            // gridItem.append(movieCard);
            movieList.append(movieCard);
        });

    } else if (model.tab === "liked_list") {
        model.likedMovies.forEach((movie) => {
            const movieCard = createMovieCard(movie);
            // const gridItem = document.createElement("div");
            // gridItem.className = "movie-card-container";
            // gridItem.append(movieCard);
            movieList.append(movieCard);
        });
    }

    const overlayContainer = document.querySelector(".overlay-container");

    if (model.selectedMovie.length !== 0) {
        const body = document.querySelector("body");
        const overlay = createMovieOverlay(model.selectedMovie);
        body.append(overlay);
    } else if (overlayContainer) {
        overlayContainer.remove();
    }
};

const createMovieOverlay = (movie) => {
    const overlayContainer = document.createElement("div");
    overlayContainer.className = "overlay-container";

    const imagePath = `${model.imageBaseURI}${model.imageSize}${movie.poster_path}`

    console.log(movie);
    const htmlTemplate = `
        <div class="overlay-card">
            <div class="img-container">
                <img src="${imagePath}"/>
            </div>
            <div class="text-area-container">
                <h1>${movie.title}</h1>
                <h3>Overview</h3>
                <p>${movie.overview}</p>
                <h3>Genres</h3>
                <ul class="genre-container">
    ${movie.genres.map((genre) => {
        return `<li class="genre-tag">${genre.name}</li>`
    }).join("")}
                </ul>
                <h3>Rating</h3>
                <p>${movie.vote_average}</p>
                <h3>Production Companies</h3>
                <div class="production-company-container">
    ${movie.production_companies
        .filter((company) => company.logo_path !== null)
        .map((company) => {
            const logoPath = `${model.imageBaseURI}${model.imageSize}${company.logo_path}`
            return `
            <div class="logo-container">
                <img src="${logoPath}"/>
            </div>
            `
        }).join("")}            
                </div>
            </div>
            <i class="ion-close"></i>
        </div>
    `
    overlayContainer.innerHTML = htmlTemplate;
    return overlayContainer;
};

const filterHandler = (e) => {
    const selectBox = e.target;
    model.filter = selectBox.value;
    model.pageNum = 1;
    loadMovies();
}

const pageBannerClickHandler = (e) => {
    const { target } = e;
    if (target.textContent === "next") {
        model.pageNum += 1;
    } else if (target.textContent === "prev") {
        model.pageNum -= 1;
    }
    loadMovies();
}

const movieListClickHandler = (e) => {
    const { target } = e;
    if (target.className === "ion-ios-heart-outline") {
        const movieCard = target.closest(".movie-card")

        const likedMovie = model.movies.filter((movie) => String(movie.id) === movieCard.id);
        const newLikedMovie = [
            ...(model.likedMovies),
            likedMovie[0]
        ]
        model.likedMovies = newLikedMovie;
        updateView();
    } else if (target.className === "ion-ios-heart") {
        const movieCard = target.closest(".movie-card")
        const newLikedMovies = model.likedMovies.filter((movie) => movie.id != movieCard.id);
        model.likedMovies = newLikedMovies;
        updateView();
    } else if (target.tagName === "P") {
        const movieCard = target.closest(".movie-card")
        fetchMovieById(movieCard.id)
            .then((data) => {
                model.selectedMovie = data;
                updateView();
                loadOverlayEvent();
            })
    }

};

const fetchMovieById = (id) => {
    const uri = `${model.apiBaseURI}/movie/${id}?api_key=${apiKey}&language=en-US`
    return fetch(uri).then((resp) => resp.json());
};

const toggleSelectedTab = (tab) => {
    const homeTab = document.querySelector(".home-tab");
    const likedListTab = document.querySelector(".liked-list-tab");

    if (tab === "home-tab") {
        if (!homeTab.classList.contains("selected")) {
            homeTab.classList.add("selected");
            likedListTab.classList.remove("selected");
        }
    } else if (tab === "liked-list-tab") {
        if (!likedListTab.classList.contains("selected")) {
            likedListTab.classList.add("selected");
            homeTab.classList.remove("selected");
        }
    }
}

const tabsClickHandler = (e) => {
    const { target } = e;
    if (target.className === "selected") {
        return;
    } else if (target.className === "home-tab") {
        toggleSelectedTab(target.className)
        model.tab = "home"
        updateView();
    } else if (target.className === "liked-list-tab") {
        toggleSelectedTab(target.className)
        model.tab = "liked_list"
        updateView();
    }
};

const loadMovies = () => {
    fetchMoviesAPI(model.filter, model.pageNum)
        .then((data) => {
            model.totalPages = data.total_pages;
            model.movies = data.results;
            updateView();
        });
}

const overlayClickHandler = (e) => {
    const { target } = e;
    if (target.className === "ion-close") {
        model.selectedMovie = [];
        updateView();
    }
}

const loadOverlayEvent = () => {
    const overlayCard = document.querySelector(".overlay-card");
    overlayCard.addEventListener("click", overlayClickHandler);
}

const loadEvents = () => {
    const selectBox = document.querySelector(".filter");
    selectBox.addEventListener("change", filterHandler);

    const pageBanner = document.querySelector(".page-banner");
    pageBanner.addEventListener("click", pageBannerClickHandler);

    const movieList = document.querySelector(".movies");
    movieList.addEventListener("click", movieListClickHandler)

    const tabsContainer = document.querySelector(".header-tabs");
    tabsContainer.addEventListener("click", tabsClickHandler);




    fetchConfig()
        .then((data) => {
            model.imageBaseURI = data.images.base_url;
            model.imageSize = data.images.backdrop_sizes[0];
        })
    fetchMoviesAPI("popular", 1)
        .then((data) => {
            model.pageNum = data.page;
            model.totalPages = data.total_pages;
            model.movies = data.results;
            updateView();
        });
};

loadEvents();