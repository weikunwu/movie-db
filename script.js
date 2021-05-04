const model = {
    movies: [],
    likedMovies: [],
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
        ]
        newLikedMovie.push(likedMovie[0])
        model.likedMovies = newLikedMovie;
        updateView();
    } else if (target.className === "ion-ios-heart") {
        const movieCard = target.closest(".movie-card")
        const newLikedMovies = model.likedMovies.filter((movie) => movie.id != movieCard.id);
        model.likedMovies = newLikedMovies;
        updateView();
    }

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