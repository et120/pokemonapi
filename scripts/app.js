import { saveToLocalStorage, getLocalStorage, removeFromLocalStorage } from "./localstorage.js";

// IDs
// Pokemon Fields
let name = document.getElementById("pokeName");
let img = document.getElementById("pokeImg");
let num = document.getElementById("pokeNum");

let type = document.getElementById("pokeType");
let location = document.getElementById("pokeLocation");
let abilities = document.getElementById("pokeAbilities");
let moves = document.getElementById("pokeMoves");
// How do i want to do this section?
let evolutionDiv = document.getElementById("evolutionDiv");
let evolutionOneImg = document.getElementById("evolutionOneImg");
let evolutionOneName = document.getElementById("evolutionOneName");
// Background
let background = document.getElementById("background");

// Buttons
let favHeartBtn = document.getElementById("favHeartBtn");
let seeFavoritesBtn = document.getElementById("seeFavoritesBtn");

let shinyFormBtn = document.getElementById("shinyFormBtn");
let shinyIcon = document.getElementById("shinyIcon");

let searchBtn = document.getElementById("searchBtn");
let randomBtn = document.getElementById("randomBtn");
let inputField = document.getElementById("inputField");

// Global JavaScript Variabls
let currentPokemon, pokemonApiData, pokeImgDefault;

// Search
searchBtn.addEventListener('click', async () => {
    if (inputField.value) {
        currentPokemon = await pokemonApi(inputField.value.toLowerCase());
    }
});

randomBtn.addEventListener('click', async () => {
    const randNum = Math.floor(Math.random() * 649);
    if (randNum) {
        currentPokemon = await pokemonApi(randNum);
    }
});

inputField.addEventListener('keydown', async (event) => {
    if (inputField.value) {
        if (event.key === 'Enter') {
            currentPokemon = await pokemonApi(event.target.value.toLowerCase());
        }
    }
});

// Favorite Icon Button
favHeartBtn.addEventListener('click', () => {
    saveToLocalStorage(currentPokemon);
});

//Shiny Icon Button
shinyFormBtn.addEventListener('click', () => {
    if (!pokeImgDefault) {
        img.src = pokemonApiData.sprites.other["official-artwork"].front_default;
        pokeImgDefault = true;
        shinyIcon.src = "./assets/Sparkle.png";
        console.log("clicked - should be default picture & unfilled icon");
    } else {
        img.src = pokemonApiData.sprites.other["official-artwork"].front_shiny;
        pokeImgDefault = false;
        shinyIcon.src = "./assets/SparkleFilled.png";
        console.log("clicked - should be SHINY picture & FILLED icon");
    }
});

//Pokemon Main API Call
const pokemonApi = async (pokemon) => {
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}/`);
    pokemonApiData = await promise.json();
    console.log(pokemonApiData);

    let pokeName = pokemonApiData.name;
    name.textContent = pokeName.charAt(0).toUpperCase() + pokeName.slice(1);

    const pokeNum = pokemonApiData.id.toString().padStart(3, '0'); //The padStart(3, '0') method pads the string representation with leading zeros to ensure it has a length of 3 characters
    num.textContent = pokeNum;

    img.src = pokemonApiData.sprites.other["official-artwork"].front_default;
    pokeImgDefault = true;
    shinyIcon.src = "./assets/Sparkle.png";

    let pokeTypesArr = pokemonApiData.types;
    let pokeTypes = pokeTypesArr.map(element => element.type.name);
    // type.textContent = pokeTypes.join(", ");
    type.textContent = pokeTypes.map(capitalizeFirstLetter).join(", ");
    background.className = backgroundClasses[pokeTypes[0]];

    let pokemonEncounterData = await encounterApi(pokemon);
    if (!pokemonEncounterData.length == 0) {
        location.textContent = capitalizeAndRemoveHyphens(pokemonEncounterData[0]["location_area"].name);
    } else {
        location.textContent = "N/a";
    }

    let pokeAbilitiesArr = pokemonApiData.abilities;
    const pokeAbilities = pokeAbilitiesArr.map(element => capitalizeFirstLetter(element.ability.name));
    abilities.textContent = pokeAbilities.join(", ");

    const pokeMovesArr = pokemonApiData.moves;
    const pokeMoves = pokeMovesArr.map(element => capitalizeFirstLetter(element.move.name));
    moves.textContent = pokeMoves.join(", ");

    const speciesPromise = await fetch(`${pokemonApiData.species.url}`);
    const speciesData = await speciesPromise.json();
    console.log(speciesData);

    const evolutionPromise = await fetch(`${speciesData.evolution_chain.url}`);
    const evolutionData = await evolutionPromise.json();
    console.log(evolutionData);

    if (evolutionData.chain.evolves_to.length === 0) {
        evolutionDiv.textContent = "N/a";
    } else {
        // const traverseEvolutions = (initialChain) => {
        //     const stack = [initialChain]; // Initialize a stack with the initialChain
        //     const evolutionsArr = [];
        //     // Start a loop that continues until the stack is empty
        //     while (stack.length > 0) {
        //         const currentChain = stack.pop(); // Pop the last element from the stack & assign it to currentChain
        //         evolutionsArr.push(currentChain.species.name); // Push the name of the current species into the evolutionsArr array
        //         // Check if the current species has evolutions
        //         if (currentChain.evolves_to.length > 0) {
        //             stack.push(...currentChain.evolves_to.reverse()); // Add the evolutions to the stack in reverse order to mimic recursion
        //         }
        //     }
        //     return evolutionsArr; // Return the array containing the names of Pokémon in the evolution chain
        // };
        // const evolutionsArr = traverseEvolutions(evolutionData.chain);

        const evolutionArr = [evolutionData.chain.species.name];
        //Recursive Function
        const traverseEvolutions = (chain) => {
            // Base case
            if (chain.evolves_to.length === 0) return;
            // Recursive case
            chain.evolves_to.forEach((evolution) => {
                evolutionArr.push(evolution.species.name);
                traverseEvolutions(evolution); // Continues until base case is reached
            });
        };
        traverseEvolutions(evolutionData.chain);
        
        evolutionDiv.innerHTML = "";
        evolutionArr.map(async (pokemonName) => {
            const div = document.createElement('div');
            div.className = ("flex-grow text-center px-5");
            
            const imgPromise = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}/`);
            const imgData = await imgPromise.json();
            
            const imgTag = document.createElement('img');
            imgTag.src = imgData.sprites.other["official-artwork"].front_default;
            
            const p = document.createElement('p');
            p.textContent = capitalizeFirstLetter(pokemonName);

            div.append(imgTag);
            div.append(p);

            evolutionDiv.append(div);
        });
    }

};

const encounterApi = async (pokemon) => {
    const promise = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}/encounters`);
    return await promise.json();
};

// Formatting
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeAndRemoveHyphens(str) {
    const words = str.split('-');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
}

//Background
const backgroundClasses = {
    normal: 'bg-normal',
    fire: 'bg-fire',
    water: 'bg-water',
    electric: 'bg-electric',
    grass: 'bg-grass',
    ice: 'bg-ice',
    fighting: 'bg-fighting',
    poison: 'bg-poison',
    ground: 'bg-ground',
    flying: 'bg-flying',
    psychic: 'bg-psychic',
    bug: 'bg-bug',
    rock: 'bg-rock',
    ghost: 'bg-ghost',
    dragon: 'bg-dragon',
    dark: 'bg-dark',
    steel: 'bg-steel',
    fairy: 'bg-fairy',
};