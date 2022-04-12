const movieContainer = document.querySelector('.movie-section');
const formContainer = document.querySelector('#form-search');
const queryContainer = formContainer.querySelector('input[name=query]');
const sortContainer = document.querySelector('#sort');
const paginationContainer = document.querySelector('.pagination');

const url = 'https://api.themoviedb.org/3/';
const posterUrl = 'https://image.tmdb.org/t/p/w1280';
const postNotFound = 'https://image.tmdb.org/t/p/w1280/nGf1tzFVu3FLVsraCExsAEOnaUL.jpg';
const movieNotFound = {
    'title': 'Movie is not found',
    'overview': '404',
    'vote_average': '0',
    'poster_path': postNotFound
};

async function getData(data = '') {
    //console.log(JSON.stringify(data));
    const mode = data.query.length > 0 ? 'search/movie?' : 'discover/movie?';
    const params = new URLSearchParams({
        api_key: "3b6207c725e466d834d328f22c49a399",
        sort_by: data.sort,
        query: data.query,
        page: data.page
    });
    const res = await fetch(url + mode + params.toString());
    const movies = await res.json();
    //console.log(movies);
    updatePagination(movies.total_pages);
    showData(movies.results);
}

const updatePagination = pages => {
    setPagination(pages);
    setActivePage(getLocalStorage('page', 1));
}

const setPagination = (pages) => {
    pages = pages > 500 ? 500 : pages;
    paginationContainer.innerHTML = "";
    const currentPage = Number(getLocalStorage('page', 1));
    if (currentPage > 2 && pages > 5) paginationContainer.appendChild(getButtonSection('pagination-item', 'page', 1));
    for (let i = 1; i <= pages; i++) {
        if (
            (currentPage === 1 && i >= (currentPage) && i <= (currentPage + 3)) ||
            (currentPage === 2 && i >= (currentPage - 1) && i <= (currentPage + 2)) ||
            (currentPage === pages && i >= (currentPage - 3) && i <= (currentPage)) ||
            (currentPage === pages - 1 && i >= (currentPage - 2) && i <= (currentPage + 1)) ||
            (i >= (currentPage - 1) && i <= (currentPage + 1))) paginationContainer.appendChild(getButtonSection('pagination-item', 'page', i));
    }
    if (
        (currentPage < pages - 1) &&
        !(currentPage < 3 && pages < 5)) paginationContainer.appendChild(getButtonSection('pagination-item', 'page', pages));
}

const showData = data => {
    movieContainer.innerHTML = "";
    if (data.length === 0) data = [movieNotFound];
    Object.entries(data).map(item => movieContainer.append(getMovieSection(item)));
}

const getMovieSection = (item) => {
    const divMovie = getDivSection('movie');
    const divDesc = getDivSection('movie-description', item[1].overview);
    const divTitle = getDivSection('movie-title', `<h2>${item[1].title}</h2>`);
    const img = getImgSection(item[1].poster_path, item[1].title);
    const divRate = getDivSection('movie-rate', item[1].vote_average);

    divMovie.appendChild(img).after(divDesc);
    divMovie.appendChild(divTitle);
    divMovie.appendChild(divRate);

    return divMovie;
}

const getDivSection = (className, content = '') => {
    const div = document.createElement('div');
    div.className = className;
    if (content.toString().length > 0) div.innerHTML = content;
    return div;
}

const getButtonSection = (className, dataName, value) => {
    const button = document.createElement('button');
    button.className = className;
    button.setAttribute(`data-${dataName}`, value);
    button.innerHTML = value;
    return button;
}

const getImgSection = (src, title) => {
    const path = src !== null ? `${posterUrl}${src}` : postNotFound;
    let img = document.createElement('img');
    img.classList.add('movie-img');
    img.src = path;
    img.alt = title;
    return img;
}

const getFilterParams = () => {
    return {
        query: getLocalStorage('query', ''),
        sort: getLocalStorage('sort', 'popularity.desc'),
        page: getLocalStorage('page', 1),
    }
};

const setActivePage = (page) => {
    paginationContainer.querySelectorAll('.pagination-item').forEach(item => {
        item.classList.remove('active');
        if (Number(item.dataset.page) === Number(page)) {
            item.classList.add('active');
        }
    })
};

const setActiveSort = (val) => sortContainer.value = val;

const setActiveQuery = (val) => queryContainer.value = val;

const init = () => {
    formContainer.querySelector('input[name="query"]').focus();
    if (getLocalStorage('page', 1) !== 1) setActivePage(getLocalStorage('page', 1));
    if (getLocalStorage('sort', null) !== null) setActiveSort(getLocalStorage('sort', null));
    if (getLocalStorage('query', null) !== null) setActiveQuery(getLocalStorage('query', null));
};

const setLocalStorage = (key, value) => localStorage.setItem(key, value);

const getLocalStorage = (key, defaultValue) => [NaN, null, 'undefined'].includes(localStorage.getItem(key)) ? defaultValue : localStorage.getItem(key);

formContainer.addEventListener('submit', event => {
    setLocalStorage('query', event.target[0].value);
    setLocalStorage('page', 1);
    event.preventDefault();
    getData(getFilterParams());
});


sortContainer.addEventListener('change', event => {
    setLocalStorage('sort', event.target.value);
    getData(getFilterParams())
});

paginationContainer.addEventListener('click', event => {
    setLocalStorage('page', event.target.dataset.page);
    getData(getFilterParams());
});

getData(getFilterParams());

window.addEventListener('load', event => {
    init();
});