
const pokeApi = {}

async function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name
   

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default

    const stats = pokeDetail.stats.map((stat) => stat.base_stat);
	pokemon.hp = stats[0];
	pokemon.atk = stats[1];
	pokemon.def = stats[2];
	pokemon.satk = stats[3];
	pokemon.sdef = stats[4];
	pokemon.spd = stats[5];

    await fetch(pokeDetail.species.url)
		.then((response) => response.json())
		.then((detail) => {
			detail.flavor_text_entries.map((text) => {
				if (text.language.name === 'en') {
					pokemon.about = text.flavor_text;
				}
			});
		})

	let weaks = [];

    await fetch(pokeDetail.types[0].type.url)
		.then((response) => response.json())
		.then((weakness) => weaks = weakness.damage_relations.double_damage_from.map((weak) => weak.name))

	for (let i = 0; i < weaks.length; i++) {
		pokemon.weakness[i] = weaks[i];
		if (i === 1) {
			break;
		}
	}



    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}
