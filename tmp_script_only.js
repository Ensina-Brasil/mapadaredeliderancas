    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""
  ></script>

  <script>
    // -------------------------
    // VARIÃVEIS GLOBAIS
    // -------------------------
    let pessoas = [];
    let map;
    let estadosLayer;
    let municipiosLayer = null;
    let paisesVizinhosLayer = null;
    let programasMarkers = [];
    const estadoBoundsBySigla = {};
    const municipiosCache = {};

    let pessoaSelecionadaKey = null;
    let highlightState = null;
    let highlightCityNorm = null;
    let selectedRegion = null; // regiÃ£o selecionada no filtro
    let hoverState = null; // estado em hover (passar mouse sobre nome na lista)

    const stateLogoMarkers = [];        // Ã­cones de parceria estadual
    let municipalLogoMarkers = [];      // marcadores dinÃ¢micos (por municÃ­pio)
    let municipalInitialMarkers = [];   // marcadores fixos (agregados ou por cidade)
    let stateExtraCityMarkers = [];     // polos estaduais (zoom)
    let municipalZoomMarkers = [];      // polos municipais (zoom)
    let currentStateLogoZoom = null;    // qual estado estÃ¡ em modo polo

    // Lampiar
    let lampiarMarkers = [];

    // DOM
    const filterRegiao = document.getElementById("filter-regiao");
    const filterEstado = document.getElementById("filter-estado");
    const filterCidade = document.getElementById("filter-cidade");
    const filterTurma  = document.getElementById("filter-turma");
    const filterPrograma = document.getElementById("filter-programa");
    const filterCargo  = document.getElementById("filter-cargo");
    const filterInstituicao = document.getElementById("filter-instituicao");
    const filterBusca = document.getElementById("filter-busca");
    const peopleList   = document.getElementById("people-list");
    const summary      = document.getElementById("summary");
    const btnLimpar    = document.getElementById("btn-limpar");
    const mapHomeBtn   = document.getElementById("map-home-btn");

    // Legenda em modo polo ou nÃ£o
    let poloLegendActive = false;

    // UF atualmente com municÃ­pios carregados
    let currentMunicipiosUF = null;

    // RegiÃµes com cores prÃ³prias
    const regionColors = {
      "Norte": "#16a34a",
      "Nordeste": "#f97316",
      "Centro-Oeste": "#8b5cf6",
      "Sudeste": "#0ea5e9",
      "Sul": "#e11d48"
    };

    // Estados com parceria estadual Ensina
    const partnershipStates = ["GO", "MT", "MS"];

    // Cidades com parceria municipal
    const municipalPartnerships = [
      { cidadeNorm: "sao luis", uf: "MA" },
      { cidadeNorm: "vitoria", uf: "ES" },
      { cidadeNorm: "caruaru", uf: "PE" },
      { cidadeNorm: "petrolina", uf: "PE" }
    ];

    // Cidades que devem ter logo jÃ¡ no mapa inicial
    const municipalInitialCities = [
      {
        nome: "SÃ£o LuÃ­s",
        uf: "MA",
        cidadeNorm: "sao luis",
        lat: -2.5307,
        lng: -44.3068
      },
      {
        nome: "VitÃ³ria",
        uf: "ES",
        cidadeNorm: "vitoria",
        lat: -20.3155,
        lng: -40.3128
      },
      {
        nome: "Caruaru",
        uf: "PE",
        cidadeNorm: "caruaru",
        lat: -8.2823,
        lng: -35.9699
      },
      {
        nome: "Petrolina",
        uf: "PE",
        cidadeNorm: "petrolina",
        lat: -9.3891,
        lng: -40.5033
      }
    ];

    // Cidades associadas Ã s parcerias estaduais (para polos)
    const statePartnershipCities = {
      GO: [
        { name: "Ãguas Lindas de GoiÃ¡s", lat: -15.7611, lng: -48.2816 },
        { name: "LuziÃ¢nia", lat: -16.2530, lng: -47.9500 }
      ],
      MT: [
        { name: "CuiabÃ¡", lat: -15.6010, lng: -56.0970 }
      ],
      MS: [
        { name: "Campo Grande", lat: -20.4697, lng: -54.6201 }
      ]
    };

    // Mapa de nome -> sigla
    const stateNameToSigla = {
      "Acre": "AC",
      "Alagoas": "AL",
      "AmapÃ¡": "AP",
      "Amazonas": "AM",
      "Bahia": "BA",
      "CearÃ¡": "CE",
      "Distrito Federal": "DF",
      "EspÃ­rito Santo": "ES",
      "GoiÃ¡s": "GO",
      "MaranhÃ£o": "MA",
      "Mato Grosso": "MT",
      "Mato Grosso do Sul": "MS",
      "Minas Gerais": "MG",
      "ParÃ¡": "PA",
      "ParaÃ­ba": "PB",
      "ParanÃ¡": "PR",
      "Pernambuco": "PE",
      "PiauÃ­": "PI",
      "Rio de Janeiro": "RJ",
      "Rio Grande do Norte": "RN",
      "Rio Grande do Sul": "RS",
      "RondÃ´nia": "RO",
      "Roraima": "RR",
      "Santa Catarina": "SC",
      "SÃ£o Paulo": "SP",
      "Sergipe": "SE",
      "Tocantins": "TO"
    };

    // RegiÃ£o de cada estado
    const stateRegionBySigla = {
      AC: "Norte",
      AL: "Nordeste",
      AP: "Norte",
      AM: "Norte",
      BA: "Nordeste",
      CE: "Nordeste",
      DF: "Centro-Oeste",
      ES: "Sudeste",
      GO: "Centro-Oeste",
      MA: "Nordeste",
      MT: "Centro-Oeste",
      MS: "Centro-Oeste",
      MG: "Sudeste",
      PA: "Norte",
      PB: "Nordeste",
      PR: "Sul",
      PE: "Nordeste",
      PI: "Nordeste",
      RJ: "Sudeste",
      RN: "Nordeste",
      RS: "Sul",
      RO: "Norte",
      RR: "Norte",
      SC: "Sul",
      SP: "Sudeste",
      SE: "Nordeste",
      TO: "Norte"
    };

    // CÃ³digo IBGE da UF -> usado no arquivo geojs-XX-mun.json
    const stateCodeBySigla = {
      AC: "12",
      AL: "27",
      AP: "16",
      AM: "13",
      BA: "29",
      CE: "23",
      DF: "53",
      ES: "32",
      GO: "52",
      MA: "21",
      MT: "51",
      MS: "50",
      MG: "31",
      PA: "15",
      PB: "25",
      PR: "41",
      PE: "26",
      PI: "22",
      RJ: "33",
      RN: "24",
      RS: "43",
      RO: "11",
      RR: "14",
      SC: "42",
      SP: "35",
      SE: "28",
      TO: "17"
    };

    // Nome do estado por sigla (pra mensagens)
    const stateNameBySigla = {
      AC: "Acre",
      AL: "Alagoas",
      AP: "AmapÃ¡",
      AM: "Amazonas",
      BA: "Bahia",
      CE: "CearÃ¡",
      DF: "Distrito Federal",
      ES: "EspÃ­rito Santo",
      GO: "GoiÃ¡s",
      MA: "MaranhÃ£o",
      MT: "Mato Grosso",
      MS: "Mato Grosso do Sul",
      MG: "Minas Gerais",
      PA: "ParÃ¡",
      PB: "ParaÃ­ba",
      PR: "ParanÃ¡",
      PE: "Pernambuco",
      PI: "PiauÃ­",
      RJ: "Rio de Janeiro",
      RN: "Rio Grande do Norte",
      RS: "Rio Grande do Sul",
      RO: "RondÃ´nia",
      RR: "Roraima",
      SC: "Santa Catarina",
      SP: "SÃ£o Paulo",
      SE: "Sergipe",
      TO: "Tocantins"
    };

    // Ãcone global de logo usando data URL (base64)
    const LOGO_SRC = "data:image/png;base64,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";

    // Ãcones
    const ensinaIcon = L.divIcon({
      html: '<div class="logo-marker logo-state"><img src="' + LOGO_SRC + '" alt="Ensina Brasil"></div>',
      className: "",
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const cityIcon = L.divIcon({
      html: '<div class="logo-marker logo-municipal"><img src="' + LOGO_SRC + '" alt="Ensina Brasil"></div>',
      className: "",
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const poloIcon = L.divIcon({
      html: '<div class="logo-marker logo-polo-state"><img src="' + LOGO_SRC + '" alt="Polo Ensina Brasil"></div>',
      className: "",
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    // Ãcone Lampiar (usa arquivo lampiar.png)
    const lampiarIcon = L.divIcon({
      html: '<div class="logo-marker logo-municipal logo-lampiar"><img src="lampiar.png" alt="Lampiar"></div>',
      className: "",
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

// Helper: adiciona hover de destaque (pequeno zoom + sombra) a um marker de logo
function attachLogoHover(marker) {
  if (!marker) return;
  marker.on('mouseover', function () {
    try {
      const el = this._icon || (this.getElement && this.getElement());
      if (el) {
        const inner = el.querySelector && el.querySelector('.logo-marker');
        if (inner) inner.classList.add('logo-marker--hover');
        else el.classList.add('logo-marker--hover');
      }
    } catch (e) {}
  });
  marker.on('mouseout', function () {
    try {
      const el = this._icon || (this.getElement && this.getElement());
      if (el) {
        const inner = el.querySelector && el.querySelector('.logo-marker');
        if (inner) inner.classList.remove('logo-marker--hover');
        else el.classList.remove('logo-marker--hover');
      }
    } catch (e) {}
  });
}

   // CIDADES DO PROGRAMA LAMPIAR (com deslocamento Ã  direita ajustado)
const lampiarCities = [
  { nome: "VitÃ³ria", uf: "ES", lat: -19.0, lng: -40.1},

  { nome: "Dourados", uf: "MS", lat: -22.2231, lng: -54.8120 },

  // SÃ£o LuÃ­s: antes lng -44.2 â†’ agora -43.5 (â‰ˆ 0.7Â° a leste)
  { nome: "SÃ£o LuÃ­s", uf: "MA", lat: -3.1, lng: -43.0 }
];


    // Cria a legenda da logo do Ensina sobre o mapa
    function criarLegendaEnsina() {
      const legendEl = document.getElementById("ensina-legend");
      if (!legendEl) return;
      legendEl.innerHTML = `
        <div class="ensina-legend-logo">
          <img src="${LOGO_SRC}" alt="Ensina Brasil" onerror="this.parentElement.innerHTML='<span style=\'font-size:14px; font-weight:bold; color:#004b8d;\'>E</span>'" />
        </div>
        <span class="ensina-legend-text">Localidade onde atua o Progama Ensina Brasil</span>
      `;

      // aplicar hover JS consistente (adiciona classe no elemento interno)
      const logoEl = legendEl.querySelector('.ensina-legend-logo');
      if (logoEl) {
        logoEl.addEventListener('mouseover', () => logoEl.classList.add('logo-marker--hover'));
        logoEl.addEventListener('mouseout', () => logoEl.classList.remove('logo-marker--hover'));
      }
    }

    function setLegendPoloMode(active) {
      const legendEl = document.getElementById("ensina-legend");
      if (!legendEl) return;
      const textSpan = legendEl.querySelector(".ensina-legend-text");
      if (!textSpan) return;

      if (active) {
        legendEl.classList.add("ensina-legend--polo");
        textSpan.textContent = "Polo de atuaÃ§Ã£o Ensina Brasil";
        poloLegendActive = true;
      } else {
        legendEl.classList.remove("ensina-legend--polo");
        textSpan.textContent = "Localidade onde atua o Progama Ensina Brasil";
        poloLegendActive = false;
      }
    }

    function getSiglaFromFeature(feature) {
      const props = feature.properties || {};
      return (
        props.sigla ||
        props.SIGLA ||
        stateNameToSigla[props.name] ||
        stateNameToSigla[props.NOME_UF] ||
        ""
      );
    }

    function getNomeFromFeature(feature) {
      const props = feature.properties || {};
      return (
        props.nome ||
        props.NOME_UF ||
        props.name ||
        getSiglaFromFeature(feature) ||
        "Estado"
      );
    }

    // Nome do municÃ­pio em um feature (GeoJSON municÃ­pios)
    function getMunicipioNome(feature) {
      const props = feature.properties || {};
      return (
        props.name ||
        props.NM_MUNICIP ||
        props.NM_MUN ||
        props.NOME ||
        props.nome ||
        ""
      );
    }

    function normalizarTexto(s) {
      return (s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    }

    function getCorPrograma(programa) {
      // Todos os programas com a mesma cor roxa (diferente do cargo que Ã© azul)
      return 'background: rgba(139, 92, 246, 0.08); color: var(--ensina-blue-dark); border: 1px solid rgba(139, 92, 246, 0.25);';
    }

    // -------------------------
    // POPUP "SEM ALUMNI"
    // -------------------------
    function showNoAlumniPopup(uf) {
      const popup = document.getElementById("no-alumni-popup");
      const textSpan = document.getElementById("no-alumni-text");
      if (!popup || !textSpan) return;

      const nomeEstado = stateNameBySigla[uf] || uf;

      textSpan.textContent =
        `Nessa localidade (${nomeEstado}) nÃ£o foram cadastrados alumni atuando (por enquanto!).`;

      popup.classList.add("show");
    }

    function hideNoAlumniPopup() {
      const popup = document.getElementById("no-alumni-popup");
      if (!popup) return;
      popup.classList.remove("show");
    }

    // Estilo dos municÃ­pios (para highlight por pessoa)
    function municipioStyle(feature) {
      const nomeMunNorm = normalizarTexto(getMunicipioNome(feature));
      const isHighlight =
        highlightCityNorm &&
        nomeMunNorm === highlightCityNorm;

      const regiao = stateRegionBySigla[currentMunicipiosUF] || "";
      const baseColor = regionColors[regiao] || "#16a34a";

      if (isHighlight) {
        return {
          color: "#0f172a",
          weight: 3,
          fillColor: baseColor,
          fillOpacity: 0.85
        };
      }

      return {
        color: baseColor,
        weight: 2.2,
        fillColor: baseColor,
        fillOpacity: 0.7
      };
    }

    // Avatar: tenta usar a bandeira da UF, senÃ£o usa avatar antigo
    function getAvatarUrl(p) {
      const uf = (p.estado_sigla || "").toUpperCase().trim();

      if (uf) {
        return "flags/" + uf + ".png";
      }

      if (p.avatar_url) {
        return p.avatar_url;
      }
      const seed = encodeURIComponent(p.nome || "Alumni Ensina");
      return "https://api.dicebear.com/7.x/thumbs/svg?seed=" + seed;
    }

    // -------------------------
    // MAPA
    // -------------------------
    function initMap() {
      map = L.map("map").setView([-15.5, -52], 4.2);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 8,
        minZoom: 3,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      const brazilBounds = L.latLngBounds(
        L.latLng(-34, -74),
        L.latLng(6, -34)
      );

      map.setMaxBounds(brazilBounds);
      // Drag habilitado com bounds constraint
      map.dragging.enable();

// Limite ampliado para todo o continente americano
const americasBounds = L.latLngBounds(
  L.latLng(-60, -120),  // sudoeste (abaixo da AmÃ©rica do Sul e mais Ã  esquerda)
  L.latLng(60, -20)     // nordeste (CanadÃ¡ / GroenlÃ¢ndia aprox.)
);

map.setMaxBounds(americasBounds);
// âŒ Remove o panInsideBounds, nÃ£o precisamos mais dele
// map.on("drag", function () {
//   map.panInsideBounds(americasBounds, { animate: false });
// });
      // Removido: evento de click que voltava para zoom nacional
      // Apenas use os botÃµes e filtros para controlar a navegaÃ§Ã£o

      map.on("zoomend", onMapZoomEnd);
    }

    function onMapZoomEnd() {
      if (!map) return;
      const z = map.getZoom();

      const hasFiltersOrSelection =
        pessoaSelecionadaKey ||
        filterRegiao.value ||
        filterEstado.value ||
        filterCidade.value ||
        poloLegendActive;

      if (z <= 5 && !hasFiltersOrSelection) {
        clearStateExtraCityMarkers();
        stateLogoMarkers.forEach(obj => {
          if (!map.hasLayer(obj.marker)) {
            obj.marker.addTo(map);
          }
        });
        currentStateLogoZoom = null;

        municipalInitialMarkers.forEach(init => {
          if (!map.hasLayer(init.marker)) {
            init.marker.addTo(map);
          }
        });

        municipalLogoMarkers.forEach(entry => {
          if (!map.hasLayer(entry.marker)) {
            entry.marker.addTo(map);
          }
        });

        clearMunicipalZoomMarkers();

        highlightState = null;
        highlightCityNorm = null;
        if (estadosLayer) {
          estadosLayer.setStyle(estadoStyle);
        }

        setLegendPoloMode(false);
      }
      // Lampiar continua sempre visÃ­vel (nÃ£o removemos aqui)
    }

    // Estilo dos estados
function estadoStyle(feature) {
  const sigla = getSiglaFromFeature(feature);
  const regiao = stateRegionBySigla[sigla];
  const baseColor = regionColors[regiao] || "#9ca3af";

  const hasPeople = pessoas && pessoas.some((p) => p.estado_sigla === sigla);
  const isSelectedState = !!highlightState && sigla === highlightState;
  const isInSelectedRegion = !selectedRegion || regiao === selectedRegion;

  // Verificar se hÃ¡ filtro de programa ativo
  const programaFiltrado = filterPrograma ? filterPrograma.value : null;
  let hasProgramInState = false;
  
  if (programaFiltrado && pessoas) {
    hasProgramInState = pessoas.some(p => p.programa === programaFiltrado && p.estado_sigla === sigla);
  }

  // Estados de outra regiÃ£o quando filtro de regiÃ£o estiver ativo
  if (selectedRegion && !isInSelectedRegion) {
    return {
      color: "#e5e7eb",
      weight: 1,
      fillColor: "#f9fafb",
      fillOpacity: 0.15,
      className: 'state-transition'
    };
  }

  // Se hÃ¡ filtro de programa, destacar apenas estados com pessoas desse programa
  if (programaFiltrado) {
    if (hasProgramInState) {
      // Estado COM pessoas do programa filtrado - destaque forte
      return {
        color: baseColor,
        weight: 3,
        fillColor: baseColor,
        fillOpacity: 0.4,
        className: 'state-transition state-highlighted'
      };
    } else {
      // Estado SEM pessoas do programa filtrado - muito apagado
      return {
        color: "#e0e0e0",
        weight: 1,
        fillColor: "#f8f8f8",
        fillOpacity: 0.15,
        className: 'state-transition state-dimmed'
      };
    }
  }

  // Quando hÃ¡ estado destacado, os outros ficam suaves (aplica tambÃ©m a estados sem alumni)
  if (highlightState && sigla !== highlightState) {
    return {
      color: "#d1d5db",
      weight: 1,
      fillColor: "#f3f4f6",
      fillOpacity: 0.35,
      className: 'state-transition'
    };
  }

  // ðŸ”¹ ESTADO SEM ALUMNI: contorno cinza mais escuro, mas bem suave
  if (!hasPeople) {
    return {
      // mantÃ©m contorno neutro, mas usa cor da regiÃ£o com opacidade bem baixa
      color: "#6b7280",
      weight: 1.2,
      fillColor: baseColor,
      fillOpacity: 0.06,
      className: 'state-transition'
    };
  }

  // ConfiguraÃ§Ã£o padrÃ£o pra estados com alumni
  let color = baseColor;
  let weight = 2;
  let fillOpacity = 0.18;

  // Quando os municÃ­pios da UF estÃ£o desenhados, deixa o estado mais â€œde fundoâ€
  if (currentMunicipiosUF && sigla === currentMunicipiosUF && municipiosLayer) {
    fillOpacity = 0.08;
    color = "#9ca3af";
  }

  // Estado selecionado (clique ou polo)
  if (isSelectedState) {
    const regionColor = regionColors[regiao] || "#004b8d";

    color = regionColor;
    weight = 3; // um pouco mais fino pra nÃ£o deformar tanto
    if (currentMunicipiosUF && sigla === currentMunicipiosUF && municipiosLayer) {
      fillOpacity = 0.1;
    } else {
      fillOpacity = 0.3;
    }
  }

  // Estado em hover (passando mouse sobre nome)
  if (hoverState) {
    if (sigla === hoverState) {
      // Estado em hover - destaque forte
      color = baseColor;
      weight = 3;
      fillOpacity = 0.4;
    } else {
      // Outros estados - levemente esbranquiÃ§ados
      fillOpacity = fillOpacity * 0.5; // Reduz opacidade pela metade
      color = "#c0c0c0"; // Cor mais clara/esbranquiÃ§ada
      weight = 1.5;
    }
  }

  return {
    color,
    weight,
    fillColor: baseColor,
    fillOpacity,
    className: 'state-transition'
  };
}


    function onEachEstado(feature, layer) {
      const sigla = getSiglaFromFeature(feature);

      if (sigla) {
        estadoBoundsBySigla[sigla] = layer.getBounds();
        const stateName = stateNameBySigla[sigla] || feature.properties && (feature.properties.name || feature.properties.NAME) || sigla;
        // tooltip com nome do estado (abre ao passar o mouse)
        try {
          layer.bindTooltip(stateName, {
            sticky: true,
            direction: 'auto',
            className: 'estado-tooltip',
            opacity: 0.95
          });
        } catch (e) {}
      }

      layer.on("click", () => {
        if (!sigla) return;

        const regiao = stateRegionBySigla[sigla] || "";
        const hasPeople = pessoas && pessoas.some(p => p.estado_sigla === sigla);

        if (!hasPeople) {
          showNoAlumniPopup(sigla);
          return;
        }

        selectedRegion = regiao || null;
        highlightState = sigla;
        highlightCityNorm = null;

        filterRegiao.value = regiao;
        atualizarOpcoesEstado(regiao);
        filterEstado.value = sigla;

        atualizarCidades();
        atualizarLista();

        if (estadosLayer) {
          estadosLayer.setStyle(estadoStyle);
        }

        ajustarZoom();
      });

      layer.on("mouseover", function (e) {
        this.setStyle({
          weight: 4,
          color: "#111827"
        });
        try { this.openTooltip(e.latlng); } catch (err) {}
      });

      layer.on("mouseout", function () {
        try { this.closeTooltip(); } catch (err) {}
        estadosLayer.resetStyle(this);
      });
    }

    function clearStateExtraCityMarkers() {
      stateExtraCityMarkers.forEach(m => map.removeLayer(m));
      stateExtraCityMarkers = [];
    }

    function clearMunicipalZoomMarkers() {
      municipalZoomMarkers.forEach(obj => map.removeLayer(obj.marker));
      municipalZoomMarkers = [];
    }

    // Clique nas logos de parceria ESTADUAL (GO, MT, MS)
    function handleStateLogoClick(sigla, marker) {
      const citiesClick = statePartnershipCities[sigla] || [];
      const regiao = stateRegionBySigla[sigla] || "";

      if (currentStateLogoZoom === sigla) {
        clearStateExtraCityMarkers();
        clearMunicipalZoomMarkers();

        if (!map.hasLayer(marker)) {
          marker.addTo(map);
        }

        municipalInitialMarkers.forEach(init => {
          if (!map.hasLayer(init.marker)) {
            init.marker.addTo(map);
          }
        });

        municipalLogoMarkers.forEach(entry => {
          if (!map.hasLayer(entry.marker)) {
            entry.marker.addTo(map);
          }
        });

        filterRegiao.value = regiao;
        filterEstado.value = "";
        highlightState = null;
        highlightCityNorm = null;

        atualizarOpcoesEstado(regiao);
        atualizarCidades();
        atualizarLista();
        if (estadosLayer) {
          estadosLayer.setStyle(estadoStyle);
        }

        setLegendPoloMode(false);
        currentStateLogoZoom = null;
        return;
      }

      currentStateLogoZoom = sigla;
      highlightState = sigla;
      highlightCityNorm = null;
      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      if (citiesClick.length) {
        const latlngs = citiesClick.map(c => [c.lat, c.lng]);

        if (latlngs.length === 1) {
          map.flyTo(latlngs[0], 6.4);
        } else {
          const b = L.latLngBounds(latlngs);
          map.flyToBounds(b, { padding: [20, 20] });
        }

        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }

        clearStateExtraCityMarkers();

        citiesClick.forEach(c => {
          const extra = L.marker([c.lat, c.lng], { icon: poloIcon })
            .addTo(map)
            .bindTooltip("Polo de atuaÃ§Ã£o Ensina Brasil â€“ " + c.name, {
              direction: "top",
              offset: [0, -10],
              opacity: 0.9
            });

          // destaque ao passar o mouse
          attachLogoHover(extra);

          stateExtraCityMarkers.push(extra);
        });

        setLegendPoloMode(true);
      }
    }

    // Clique nas logos de parceria MUNICIPAL
    function handleMunicipalLogoClick(uf, marker) {
      const polos = municipalInitialCities.filter(c => c.uf === uf);
      if (!polos.length) return;

      const latlngs = polos.map(c => [c.lat, c.lng]);
      if (latlngs.length === 1) {
        map.flyTo(latlngs[0], 6.4);
      } else {
        const b = L.latLngBounds(latlngs);
        map.flyToBounds(b, { padding: [20, 20] });
      }

      municipalInitialMarkers.forEach(entry => {
        if (entry.uf === uf && map.hasLayer(entry.marker)) {
          map.removeLayer(entry.marker);
        }
      });

      municipalLogoMarkers.forEach(entry => {
        if (entry.uf === uf && map.hasLayer(entry.marker)) {
          map.removeLayer(entry.marker);
        }
      });

      clearMunicipalZoomMarkers();

      highlightState = uf;
      highlightCityNorm = null;
      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      polos.forEach(c => {
        const bigMarker = L.marker([c.lat, c.lng], { icon: poloIcon })
          .addTo(map)
          .bindTooltip("Polo de atuaÃ§Ã£o Ensina Brasil â€“ " + c.nome, {
            direction: "top",
            offset: [0, -10],
            opacity: 0.9
          });

        // destaque ao passar o mouse
        attachLogoHover(bigMarker);

        municipalZoomMarkers.push({ uf, marker: bigMarker });
      });

      setLegendPoloMode(true);
    }

    function carregarEstados() {
      const urlGeoJSON =
        "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

      fetch(urlGeoJSON)
        .then(r => r.json())
        .then(geo => {
          // Cria a layer de estados
          estadosLayer = L.geoJSON(geo, {
            style: estadoStyle,
            onEachFeature: onEachEstado
          }).addTo(map);

          // Garante que todos os bounds fiquem salvos em estadoBoundsBySigla
          estadosLayer.eachLayer(layer => {
            const sigla = getSiglaFromFeature(layer.feature);
            if (sigla) {
              estadoBoundsBySigla[sigla] = layer.getBounds();
            }
          });

          // Adiciona logos nos estados parceiros (GO, MT, MS)
          partnershipStates.forEach(sigla => {
            const bounds = estadoBoundsBySigla[sigla];
            if (!bounds) return;

            const markerLatLng = bounds.getCenter();

            let tooltipText = "Parceria estadual";
            if (sigla === "GO") tooltipText = "Parceria estadual GoiÃ¡s";
            if (sigla === "MT") tooltipText = "Parceria estadual Mato Grosso";
            if (sigla === "MS") tooltipText = "Parceria estadual Mato Grosso do Sul";

            const marker = L.marker(markerLatLng, { icon: ensinaIcon })
              .addTo(map)
              .bindTooltip(tooltipText, {
                direction: "top",
                offset: [0, -10],
                opacity: 0.9
              });

            marker.on("click", () => handleStateLogoClick(sigla, marker));

            // aplicar destaque hover nas logos de parceria estadual
            try { attachLogoHover(marker); } catch (e) {}
            stateLogoMarkers.push({ sigla, marker });
          });
        })
        .catch(err => {
          console.error("Erro ao carregar GeoJSON de estados:", err);
        });
    }

    // -------------------------
    // PAÃSES VIZINHOS (estilo cinza)
    // -------------------------
    function carregarPaisesVizinhos() {
      const urlGeoJSON =
        "https://nacisworld.org/download/natural-earth/10m/cultural/ne_10m_admin_0_countries.zip";

      // Alternativa: usar um GeoJSON mais simples e acessÃ­vel
      const urlSimples = 
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson";

      fetch(urlSimples)
        .then(r => r.json())
        .then(geo => {
          // Filtra apenas paÃ­ses da AmÃ©rica do Sul/Central
          const paisesAmerica = geo.features.filter(f => {
            const props = f.properties || {};
            const continent = props.CONTINENT || "";
            return continent === "South America" || continent === "North America" || continent === "Central America";
          });

          // Exclui o Brasil
          const paisesVizinhos = paisesAmerica.filter(f => {
            const props = f.properties || {};
            return props.NAME !== "Brazil";
          });

          if (paisesVizinhos.length > 0) {
            // estilo base para paÃ­ses vizinhos
            const paisBaseStyle = {
              color: "#6b7280",
              weight: 1.6,
              fillColor: "#f9fafb",
              fillOpacity: 0.18
            };

            paisesVizinhosLayer = L.geoJSON(
              { type: "FeatureCollection", features: paisesVizinhos },
              {
                style: paisBaseStyle,
                onEachFeature: function (feature, layer) {
                  layer.on('mouseover', function () {
                    layer.setStyle({ color: '#0ea5e9', weight: 2.8, fillOpacity: 0.28 });
                  });
                  layer.on('mouseout', function () {
                    layer.setStyle(paisBaseStyle);
                  });
                }
              }
            ).addTo(map);

            // Coloca atrÃ¡s dos estados brasileiros
            if (estadosLayer) {
              estadosLayer.bringToFront();
            }
          }
        })
        .catch(err => {
          console.error("Erro ao carregar GeoJSON de paÃ­ses vizinhos:", err);
        });
    }

    // -------------------------
    // PROGRAMAS TEACH FOR ALL (EnseÃ±a/Ensina)
    // -------------------------
    function adicionarProgramasTeachForAll() {
      const programas = [
        {
          pais: "Argentina",
          nome: "EnseÃ±Ã¡ por Argentina",
          lat: -38.4161,
          lng: -63.6167,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ar.svg",
          site: "https://ensenaporargentina.org",
          mostrarSempre: true
        },
        {
          pais: "BolÃ­via",
          nome: "EnseÃ±a Bolivia",
          lat: -16.5,
          lng: -63.5823,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/bo.svg",
          site: "https://ensenabolivia.org",
          mostrarSempre: true
        },
        {
          pais: "Chile",
          nome: "EnseÃ±a Chile",
          lat: -30.7191,
          lng: -71.5439,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/cl.svg",
          site: "https://www.ensenachile.cl",
          mostrarSempre: true
        },
        {
          pais: "ColÃ´mbia",
          nome: "EnseÃ±a por Colombia",
          lat: 4.5709,
          lng: -74.2973,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/co.svg",
          site: "https://ensenaporcolombia.org",
          mostrarSempre: true
        },
        {
          pais: "Equador",
          nome: "EnseÃ±a Ecuador",
          lat: -0.1807,
          lng: -78.4678,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ec.svg",
          site: "https://ensenaecuador.org",
          mostrarSempre: true
        },
        {
          pais: "MÃ©xico",
          nome: "EnseÃ±a por MÃ©xico",
          lat: 19.4326,
          lng: -99.1332,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/mx.svg",
          site: "https://ensenapormexico.org",
          mostrarSempre: true
        },
        {
          pais: "United States of America",
          nome: "Teach For America",
          lat: 39.8283,
          lng: -98.5795,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg",
          site: "https://teachforamerica.org",
          mostrarSempre: true
        },
        {
          pais: "Paraguai",
          nome: "EnseÃ±a Paraguay",
          lat: -25.2637,
          lng: -57.5759,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/py.svg",
          site: "https://ensenaparaguay.org",
          mostrarSempre: true
        },
        {
          pais: "Peru",
          nome: "EnseÃ±a PerÃº",
          lat: -12.0464,
          lng: -77.0428,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/pe.svg",
          site: "https://ensenaperu.org",
          mostrarSempre: true
        },
        {
          pais: "Uruguai",
          nome: "EnseÃ±a Uruguay",
          lat: -34.9011,
          lng: -56.1645,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/uy.svg",
          site: "https://www.ensenauruguay.org",
          mostrarSempre: true
        },
        {
          pais: "PanamÃ¡",
          nome: "EnseÃ±a por PanamÃ¡",
          lat: 8.9824,
          lng: -79.5199,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/pa.svg",
          site: "https://ensenaporpanama.com",
          mostrarSempre: true
        },

        {
          pais: "Haiti",
          nome: "Anseye Pou Ayiti",
          lat: 18.9712,
          lng: -72.2852,
          logo: "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ht.svg",
          site: "https://anseyepouayiti.org",
          mostrarSempre: true
        }
      ];

      programas.forEach(prog => {
        // helper: cria Ã­cone com tamanho variÃ¡vel (hover aumenta)
        function createIcon(size = 26) {
          return L.divIcon({
            html: `
              <div class="logo-marker logo-program" style="width: ${size}px; height: ${size}px; border-radius: 50%; border: 1.5px solid #004b8d; background: white; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${prog.logo}" alt="${prog.pais}" style="width: 85%; height: 85%; object-fit: cover; border-radius: 50%;" onerror="this.parentElement.innerHTML='<span style=\\'font-size: 12px; font-weight: bold; color: #004b8d;\\'>${prog.pais.charAt(0).toUpperCase()}</span>';">
              </div>
            `,
            className: "",
            iconSize: [size, size],
            iconAnchor: [Math.round(size / 2), Math.round(size / 2)]
          });
        }

        const marker = L.marker([prog.lat, prog.lng], { icon: createIcon(26) })
          .bindPopup(`
            <div style="text-align: center; font-weight: 500; font-family: 'Inter', sans-serif;">
              <strong>${prog.pais}</strong><br>
              <span style="font-size: 0.9rem; color: #6b7280;">${prog.nome}</span><br>
              <a href="${prog.site}" target="_blank" rel="noopener noreferrer" style="font-size: 0.85rem; color: #0ea5e9; text-decoration: underline;">Visitar site</a>
            </div>
          `, {
            maxWidth: 200,
            className: "programa-popup"
          });

        // Usamos attachLogoHover para escala/sombra; popup abre no click (nÃ£o no hover)
        marker.addTo(map);
        try { attachLogoHover(marker); } catch (e) {}
        programasMarkers.push({ marker, prog });
      });


    }



    // -------------------------
    // MUNICÃPIOS
    // -------------------------
    function limparMunicipios() {
      if (municipiosLayer) {
        map.removeLayer(municipiosLayer);
        municipiosLayer = null;
      }

      currentMunicipiosUF = null;

      municipalLogoMarkers.forEach(obj => map.removeLayer(obj.marker));
      municipalLogoMarkers = [];
    }

    function carregarMunicipiosEstado(sigla) {
      const code = stateCodeBySigla[sigla];
      if (!code) {
        limparMunicipios();
        return;
      }

      currentMunicipiosUF = sigla;

      const cidadesSet = new Set(
        pessoas
          .filter(p => p.estado_sigla === sigla)
          .map(p => normalizarTexto(p.cidade))
          .filter(Boolean)
      );

      if (!cidadesSet.size && !municipalPartnerships.some(pc => pc.uf === sigla)) {
        limparMunicipios();
        return;
      }

      const url = `https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-${code}-mun.json`;

      const desenhar = (geo) => {
        const centersByCidadeNorm = {};
        (geo.features || []).forEach(f => {
          const nomeNorm = normalizarTexto(getMunicipioNome(f));
          if (!nomeNorm) return;
          const tempLayer = L.geoJSON(f);
          centersByCidadeNorm[nomeNorm] = tempLayer.getBounds().getCenter();
        });

        const featuresFiltradas = (geo.features || []).filter(f => {
          const nomeMun = normalizarTexto(getMunicipioNome(f));
          return cidadesSet.has(nomeMun);
        });

        limparMunicipios();
        currentMunicipiosUF = sigla;

        if (featuresFiltradas.length) {
          municipiosLayer = L.geoJSON(
            { type: "FeatureCollection", features: featuresFiltradas },
            {
              style: municipioStyle
            }
          ).addTo(map);

          if (estadosLayer) {
            estadosLayer.setStyle(estadoStyle);
          }
        }

                municipalPartnerships
          .filter(pc => pc.uf === sigla)
          .forEach(pc => {
            // JÃ¡ tÃªm marcador inicial agregado/individual:
            // nÃ£o recriar marcador de parceria ao carregar municÃ­pios
            if (sigla === "PE" || sigla === "ES" || sigla === "MA") return;

            const center = centersByCidadeNorm[pc.cidadeNorm];
            if (!center) return;

            const marker = L.marker(center, { icon: cityIcon })
              .addTo(map)
              .bindTooltip("Parceria com MunicÃ­pios", {
                direction: "top",
                offset: [0, -10],
                opacity: 0.9
              });

            marker.on("click", () => {
              handleMunicipalLogoClick(sigla, marker);
            });

            municipalLogoMarkers.push({ uf: sigla, marker });
          });

      };

      if (municipiosCache[sigla]) {
        desenhar(municipiosCache[sigla]);
        return;
      }

      fetch(url)
        .then(r => r.json())
        .then(geo => {
          municipiosCache[sigla] = geo;
          desenhar(geo);
        })
        .catch(err => {
          console.error("Erro ao carregar municÃ­pios do estado", sigla, err);
        });
    }

    // -------------------------
    // LOGOS MUNICIPAIS INICIAIS
    // -------------------------
    function adicionarLogosMunicipaisIniciais() {
      const groupedByUF = {};
      municipalInitialCities.forEach(c => {
        if (!groupedByUF[c.uf]) groupedByUF[c.uf] = [];
        groupedByUF[c.uf].push(c);
      });

      Object.keys(groupedByUF).forEach(uf => {
        const cities = groupedByUF[uf];

        if (uf === "PE" || uf === "ES") {
          const latlngs = cities.map(c => [c.lat, c.lng]);
          const bounds = L.latLngBounds(latlngs);
          const center = bounds.getCenter();

          const marker = L.marker(center, { icon: cityIcon })
            .addTo(map)
            .bindTooltip("Parceria com MunicÃ­pios", {
              direction: "top",
              offset: [0, -10],
              opacity: 0.9
            });

          marker.on("click", () => {
            handleMunicipalLogoClick(uf, marker);
          });

          // aplicar hover de destaque tambÃ©m aos marcadores iniciais
          try { attachLogoHover(marker); } catch (e) {}

          municipalInitialMarkers.push({
            uf,
            nome: "Parceria com MunicÃ­pios",
            marker
          });
        } else {
          cities.forEach(cidade => {
            const marker = L.marker([cidade.lat, cidade.lng], { icon: cityIcon })
              .addTo(map)
              .bindTooltip("Parceria com MunicÃ­pios", {
                direction: "top",
                offset: [0, -10],
                opacity: 0.9
              });

            marker.on("click", () => {
              handleMunicipalLogoClick(cidade.uf, marker);
            });

            // aplicar hover de destaque tambÃ©m aos marcadores municipais individuais
            try { attachLogoHover(marker); } catch (e) {}

            municipalInitialMarkers.push({
              uf: cidade.uf,
              nome: cidade.nome,
              marker
            });
          });
        }
      });
    }

    // -------------------------
    // LOGOS PROGRAMA LAMPIAR
    // -------------------------
    function limparLogosLampiar() {
      lampiarMarkers.forEach(m => map.removeLayer(m));
      lampiarMarkers = [];
    }

function adicionarLogosLampiar() {
  if (!map) return;

  limparLogosLampiar();

  lampiarCities.forEach(cidade => {

    const marker = L.marker([cidade.lat, cidade.lng], { icon: lampiarIcon })
      .addTo(map)
      .bindTooltip(
        "Programa Lampiar â€“ " + cidade.nome + "/" + cidade.uf,
        { direction: "top", offset: [0, -10], opacity: 0.9 }
      );

    // ðŸ”¹ Clique: destacar UF igual ao Ã­cone do Ensina + zoom para o estado
    marker.on('click', function () {
      const uf = cidade.uf;
      const regiao = stateRegionBySigla[uf] || "";

      // Atualiza variÃ¡veis de destaque
      selectedRegion = regiao || null;
      highlightState = uf;
      highlightCityNorm = null;

      // Ajusta filtros da lateral
      filterRegiao.value = regiao;
      atualizarOpcoesEstado(regiao || null);
      filterEstado.value = uf;
      filterCidade.value = "";
      filterTurma.value = "";

      atualizarCidades();
      atualizarLista();

      // Reaplica estilo dos estados para refletir highlightState
      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      // Carrega municÃ­pios da UF (como nos outros fluxos)
      carregarMunicipiosEstado(uf);

      // Zoom para o estado (usa bounds se tiver, senÃ£o vai pro centro)
      try {
        const bounds = estadoBoundsBySigla && estadoBoundsBySigla[uf];
        if (bounds && bounds.isValid && bounds.isValid()) {
          const padded = bounds.pad ? bounds.pad(0.12) : bounds;
          map.fitBounds(padded, { animate: true, maxZoom: 6 });
        } else {
          // fallback: centro do ponto, zoom estadual
          map.flyTo([cidade.lat, cidade.lng], 7);
        }
      } catch (e) {
        // fallback hard caso algo dÃª ruim nos bounds
        map.flyTo([cidade.lat, cidade.lng], 7);
      }
    });

    // hover bonito (escala + sombra)
    attachLogoHover(marker);

    lampiarMarkers.push(marker);
  });
}

    // -------------------------
    // ZOOMS
    // -------------------------
    function zoomNacional() {
      highlightState = null;
      highlightCityNorm = null;
      selectedRegion = null;

      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      if (map) {
        map.flyTo([-15.5, -52], 4.2);
      }

      limparMunicipios();
      clearStateExtraCityMarkers();
      clearMunicipalZoomMarkers();
      currentStateLogoZoom = null;
      setLegendPoloMode(false);
      // Lampiar continua visÃ­vel
    }

    function zoomRegiao(regiao) {
      if (!regiao || !map || !estadosLayer) return;

      const ufs = Object.keys(stateRegionBySigla).filter(
        (sigla) => stateRegionBySigla[sigla] === regiao
      );

      const boundsList = ufs
        .map((sigla) => estadoBoundsBySigla[sigla])
        .filter(Boolean);

      if (!boundsList.length) return;

      let combined = boundsList[0].clone();
      for (let i = 1; i < boundsList.length; i++) {
        combined.extend(boundsList[i]);
      }

      map.flyToBounds(combined, {
        padding: [40, 40],
        maxZoom: 5.2,
        animate: true,
      });
    }

    function zoomEstado(sigla) {
      if (!sigla || !map) return;

      let b = estadoBoundsBySigla[sigla];

      if (!b && estadosLayer) {
        estadosLayer.eachLayer(layer => {
          const s = getSiglaFromFeature(layer.feature);
          if (s === sigla) {
            b = layer.getBounds();
            estadoBoundsBySigla[sigla] = b;
          }
        });
      }

      if (b) {
        map.flyToBounds(b, {
          padding: [40, 40],
          maxZoom: 5.8,
          animate: true
        });
      }

      carregarMunicipiosEstado(sigla);
    }

    function zoomLocal(sigla) {
      const b = estadoBoundsBySigla[sigla];
      if (b) {
        const center = b.getCenter();
        map.flyTo(center, 7);
      }
      carregarMunicipiosEstado(sigla);
    }

    // -------------------------
    // SELEÃ‡ÃƒO DE PESSOA
    // -------------------------
    function criarChavePessoa(p) {
      return (p.nome || "") + "|" + (p.estado_sigla || "") + "|" + (p.cidade || "");
    }

    function selecionarPessoa(p) {
      const key = criarChavePessoa(p);
      pessoaSelecionadaKey = key;

      highlightState = p.estado_sigla || null;
      highlightCityNorm = normalizarTexto(p.cidade || "");

      if (p.estado_sigla) {
        filterRegiao.value = stateRegionBySigla[p.estado_sigla] || "";
        atualizarOpcoesEstado(filterRegiao.value || null);
        filterEstado.value = p.estado_sigla;
      }

      atualizarCidades();
      atualizarLista();

      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      ajustarZoom();
      if (p.estado_sigla) {
        carregarMunicipiosEstado(p.estado_sigla);
      }
    }

    function limparSelecao() {
      pessoaSelecionadaKey = null;
      highlightState = null;
      highlightCityNorm = null;
      selectedRegion = null;

      filterRegiao.value = "";
      filterEstado.value = "";
      filterCidade.value = "";
      filterTurma.value = "";
      filterBusca.value = "";

      atualizarOpcoesEstado(null);
      atualizarCidades();
      atualizarLista();

      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      zoomNacional();
    }

    function ajustarZoom() {
      const regiaoAtual = filterRegiao.value;
      const estadoAtual = filterEstado.value;
      const cidadeAtual = filterCidade.value;

      if (!regiaoAtual && !estadoAtual && !cidadeAtual) {
        zoomNacional();
      } else if (regiaoAtual && !estadoAtual) {
        zoomRegiao(regiaoAtual);
      } else if (estadoAtual && !cidadeAtual) {
        zoomEstado(estadoAtual);
      } else if (estadoAtual && cidadeAtual) {
        zoomLocal(estadoAtual);
      }
    }

    // -------------------------
    // PESSOAS (Google Sheets - Ãšnica Fonte)
    // -------------------------
    const API_URL = "https://script.google.com/macros/s/AKfycbzFaeymHhdsSw_f4HdOkVJqSHxR5kgcdYsPtSUsxtkAmyHy3XEP-quQaR4s7MYC2Lbn/exec";

    function carregarPessoas() {
      console.log("ðŸ“Š Carregando alumni da planilha Google Sheets...");
      
      fetch(API_URL + "?t=" + new Date().getTime(), {
        method: 'GET',
        redirect: 'follow'
      })
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`Erro HTTP ${resp.status}: ${resp.statusText}`);
          }
          return resp.json();
        })
        .then(data => {
          console.log("âœ… Dados carregados com sucesso!");
          console.log("ðŸ“¦ Total de registros:", data.length);
          
          if (!Array.isArray(data)) {
            throw new Error("Resposta da API nÃ£o Ã© um array vÃ¡lido");
          }
          
          if (data.length === 0) {
            summary.textContent = "Nenhum alumni encontrado na planilha.";
            console.warn("âš ï¸ Planilha retornou 0 registros");
            return;
          }
          
          inicializarComDados(data);
        })
        .catch(err => {
          console.error("âŒ Erro ao carregar dados da planilha:", err);
          summary.textContent = "Erro ao carregar dados da planilha: " + err.message;
        });
    }

    function inicializarComDados(data) {
      console.log("ðŸš€ Inicializando mapa com", data.length, "alumni");
      
      pessoas = data
        .filter(p => p.nome && p.nome.trim() !== "")
        .map(p => {
          if (!p.regiao && p.estado_sigla) {
            p.regiao = stateRegionBySigla[p.estado_sigla] || "";
          }
          return p;
        });
      
      console.log("âœ… Total apÃ³s filtro:", pessoas.length, "alumni vÃ¡lidos");
      
      popularFiltros();
      atualizarTurmas();
      atualizarProgramas();
      atualizarCargos();
      atualizarInstituicoes();
      atualizarLista();
      
      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }
      ajustarZoom();
    }

    // -------------------------
    // FILTROS E LISTA
    // -------------------------
    function atualizarOpcoesEstado(regiao) {
      filterEstado.innerHTML = "";
      const optEstadoAll = document.createElement("option");
      optEstadoAll.value = "";
      optEstadoAll.textContent = regiao ? "Todos da regiÃ£o" : "Todos";
      filterEstado.appendChild(optEstadoAll);

      let estados = [...new Set(pessoas.map((p) => p.estado_sigla).filter(Boolean))].sort();

      if (regiao) {
        estados = estados.filter((sigla) => stateRegionBySigla[sigla] === regiao);
      }

      estados.forEach((sigla) => {
        const opt = document.createElement("option");
        opt.value = sigla;
        opt.textContent = sigla;
        filterEstado.appendChild(opt);
      });
    }

    function popularFiltros() {
      const regioes = [...new Set(pessoas.map(p => p.regiao).filter(Boolean))].sort();
      regioes.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r;
        opt.textContent = r;
        filterRegiao.appendChild(opt);
      });

      atualizarOpcoesEstado(null);
      atualizarCidades();
    }

    function atualizarTurmas() {
      const regiaoAtual = filterRegiao.value;
      const estadoAtual = filterEstado.value;
      const cidadeAtual = filterCidade.value;

      filterTurma.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Todas";
      filterTurma.appendChild(optAll);

      let filtradas = [...pessoas];

      if (regiaoAtual) {
        filtradas = filtradas.filter(p => p.regiao === regiaoAtual);
      }
      if (estadoAtual) {
        filtradas = filtradas.filter(p => p.estado_sigla === estadoAtual);
      }
      if (cidadeAtual) {
        filtradas = filtradas.filter(p => p.cidade === cidadeAtual);
      }

      const turmas = [...new Set(
        filtradas.map(p => p.turma).filter(Boolean)
      )].sort();

      turmas.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        filterTurma.appendChild(opt);
      });
    }

    function atualizarProgramas() {
      filterPrograma.innerHTML = '<option value="">Todos</option>';
      const programas = [...new Set(pessoas.map(p => p.programa).filter(Boolean))].sort();
      programas.forEach(prog => {
        const opt = document.createElement("option");
        opt.value = prog;
        opt.textContent = prog;
        filterPrograma.appendChild(opt);
      });
    }

    function atualizarCargos() {
      filterCargo.innerHTML = '<option value="">Todos</option>';
      const cargos = [...new Set(pessoas.map(p => p.funcao).filter(Boolean))].sort();
      cargos.forEach(cargo => {
        const opt = document.createElement("option");
        opt.value = cargo;
        opt.textContent = cargo;
        filterCargo.appendChild(opt);
      });
    }

    function atualizarInstituicoes() {
      filterInstituicao.innerHTML = '<option value="">Todas</option>';
      const instituicoes = [...new Set(pessoas.map(p => p.instituicao).filter(Boolean))].sort();
      instituicoes.forEach(inst => {
        const opt = document.createElement("option");
        opt.value = inst;
        opt.textContent = inst;
        filterInstituicao.appendChild(opt);
      });
    }

    function atualizarCidades() {
      const regiaoAtual = filterRegiao.value;
      const estadoAtual = filterEstado.value;

      filterCidade.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Todas";
      filterCidade.appendChild(optAll);

      let filtradas = [...pessoas];

      if (regiaoAtual) {
        filtradas = filtradas.filter(p => p.regiao === regiaoAtual);
      }
      if (estadoAtual) {
        filtradas = filtradas.filter(p => p.estado_sigla === estadoAtual);
      }

      const cidades = [...new Set(
        filtradas.map(p => p.cidade).filter(Boolean)
      )].sort();

      cidades.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        filterCidade.appendChild(opt);
      });

      atualizarTurmas();
    }

    function atualizarLista() {
      const regiaoAtual = filterRegiao.value;
      const estadoAtual = filterEstado.value;
      const cidadeAtual = filterCidade.value;
      const turmaAtual  = filterTurma.value;

      let filtradas = [...pessoas];

      if (regiaoAtual) {
        filtradas = filtradas.filter(p => p.regiao === regiaoAtual);
      }
      if (estadoAtual) {
        filtradas = filtradas.filter(p => p.estado_sigla === estadoAtual);
      }
      if (cidadeAtual) {
        filtradas = filtradas.filter(p => p.cidade === cidadeAtual);
      }
      if (turmaAtual) {
        filtradas = filtradas.filter(p => p.turma === turmaAtual);
      }

      const buscaAtual = filterBusca.value.trim();
      if (buscaAtual) {
        const buscaNorm = normalizarTexto(buscaAtual);
        filtradas = filtradas.filter(p => normalizarTexto(p.nome || "").includes(buscaNorm));
      }

      // Ordenar alfabeticamente por nome
      filtradas.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", 'pt-BR'));

      summary.textContent =
        `${filtradas.length} pessoa(s) encontrada(s)` +
        (regiaoAtual || estadoAtual || cidadeAtual || turmaAtual || buscaAtual
          ? " com os filtros aplicados."
          : " no total.");

      peopleList.innerHTML = "";

      if (!filtradas.length) {
        if (estadoAtual) {
          summary.textContent = "Nenhuma pessoa cadastrada neste estado atÃ© o momento.";
          peopleList.innerHTML = `
            <div style="font-size:0.85rem; color:#6b7280; line-height:1.5;">
              <p>
                Nessa localidade ainda nÃ£o foram cadastrados alumni atuando (por enquanto!).
              </p>
              <p>
                Se vocÃª Ã© alumni do Ensina Brasil e estÃ¡ atuando aqui,
                <a href="https://forms.gle/K7C6H93niomnqaHPA" target="_blank" rel="noopener noreferrer">
                  preencha o formulÃ¡rio de cadastro
                </a>
                para aparecer neste mapa.
              </p>
            </div>
          `;
        } else {
          summary.textContent = "Nenhuma pessoa encontrada com os filtros aplicados.";
          peopleList.textContent = "Nenhum registro encontrado para este filtro.";
        }
        return;
      }

      filtradas.forEach(p => {
        const div = document.createElement("div");
        div.className = "person-card";

        const key = criarChavePessoa(p);

        if (pessoaSelecionadaKey) {
          if (key === pessoaSelecionadaKey) {
            div.classList.add("selected");
          } else {
            div.classList.add("dimmed");
          }
        }

        div.innerHTML = `
  <div class="person-main-row">
    <!-- Nome Ã  esquerda -->
    <div class="person-main-left">
      <strong>${p.nome}</strong>
    </div>

    <!-- LinkedIn CENTRAL -->
    <div class="person-main-middle">
      ${
        p.linkedin
          ? `
            <span class="linkedin-line">
              <img class="linkedin-icon"
                   src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                   alt="LinkedIn">
              <a href="${p.linkedin}" target="_blank">LinkedIn</a>
            </span>
          `
          : ""
      }
    </div>

    <!-- Cidade + bandeira Ã  direita -->
    <div class="person-main-right">
      <span class="clickable-filter" data-filter="cidade" data-value="${p.cidade || ""}" style="cursor: pointer;" title="Filtrar por ${p.cidade}">${p.cidade || ""} - ${p.estado_sigla || ""}</span>
      <img class="person-flag clickable-filter" data-filter="estado" data-value="${p.estado_sigla}" src="bandeiras/${p.estado_sigla}.png" alt="Bandeira de ${p.estado_sigla}" style="cursor: pointer;" title="Filtrar por ${p.estado_sigla}">
    </div>
  </div>
          <div class="person-bottom-row">
            ${p.programa ? `<span class="badge badge-programa ${normalizarTexto(p.programa)} clickable-filter" data-filter="programa" data-value="${p.programa}" style="cursor: pointer; ${getCorPrograma(p.programa)} font-weight: 600;" title="Filtrar por programa">${p.programa}</span>` : ""}
            <span class="badge badge-role clickable-filter" data-filter="cargo" data-value="${p.funcao || ''}" style="cursor: pointer;" title="Filtrar por cargo">${p.funcao || "Sem funÃ§Ã£o"}</span>
            ${
              p.instituicao
                ? `<span class="badge badge-inst clickable-filter" data-filter="instituicao" data-value="${p.instituicao}" style="cursor: pointer;" title="Filtrar por instituiÃ§Ã£o">${p.instituicao}</span>`
                : ""
            }
            <span class="badge badge-turma clickable-filter" data-filter="turma" data-value="${p.turma || ''}" style="cursor: pointer;" title="Filtrar por turma">Turma ${p.turma || "-"}</span>
          </div>
        `;

        div.addEventListener("click", (e) => {
          // Se clicou em um badge de filtro, aplicar filtro
          if (e.target.classList.contains('clickable-filter')) {
            e.stopPropagation();
            const filterType = e.target.getAttribute('data-filter');
            const filterValue = e.target.getAttribute('data-value');
            
            if (filterType && filterValue) {
              // Aplicar o filtro
              if (filterType === 'cidade') filterCidade.value = filterValue;
              else if (filterType === 'estado') filterEstado.value = filterValue;
              else if (filterType === 'turma') filterTurma.value = filterValue;
              else if (filterType === 'programa') filterPrograma.value = filterValue;
              else if (filterType === 'cargo') filterCargo.value = filterValue;
              else if (filterType === 'instituicao') filterInstituicao.value = filterValue;
              else if (filterType === 'instituicao') filterInstituicao.value = filterValue;
              
              // Atualizar a lista
              atualizarLista();
            }
          } else {
            // Comportamento normal: selecionar pessoa
            selecionarPessoa(p);
          }
        });

        div.addEventListener("mouseenter", () => {
          const estadoPessoa = p.estado_sigla;
          const cidadeNorm = normalizarTexto(p.cidade || "");

          // Destacar o estado da pessoa no hover (sem apagar os outros)
          hoverState = estadoPessoa;
          if (estadosLayer) {
            estadosLayer.setStyle(estadoStyle);
            
            // Abrir tooltip do estado
            estadosLayer.eachLayer((layer) => {
              const sigla = getSiglaFromFeature(layer.feature);
              if (sigla === estadoPessoa) {
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                layer.openTooltip(center);
              }
            });
          }

          if (
            estadoPessoa &&
            filterEstado.value === estadoPessoa &&
            municipiosLayer &&
            currentMunicipiosUF === estadoPessoa
          ) {
            highlightCityNorm = cidadeNorm;
            municipiosLayer.setStyle(municipioStyle);
          }
        });

        div.addEventListener("mouseleave", () => {
          // Remover hover do estado
          hoverState = null;
          
          // Fechar tooltips dos estados
          if (estadosLayer) {
            estadosLayer.eachLayer((layer) => {
              layer.closeTooltip();
            });
          }
          
          if (pessoaSelecionadaKey) {
            const partes = pessoaSelecionadaKey.split("|");
            const cidadeSel = partes[2] || "";
            const ufSel = partes[1] || "";

            highlightState = ufSel || null;
            highlightCityNorm = normalizarTexto(cidadeSel || "");
          } else {
            highlightState = filterEstado.value || null;
            highlightCityNorm = null;
          }

          // Atualizar estilo dos estados
          if (estadosLayer) {
            estadosLayer.setStyle(estadoStyle);
          }

          if (municipiosLayer) {
            municipiosLayer.setStyle(municipioStyle);
          }
        });

        peopleList.appendChild(div);
      });
    }

    // -------------------------
    // EVENTOS DOS FILTROS E BOTÃ•ES
    // -------------------------
    filterRegiao.addEventListener("change", () => {
      const regiao = filterRegiao.value || "";

      selectedRegion = regiao || null;
      highlightState = null;
      highlightCityNorm = null;

      filterEstado.value = "";
      filterCidade.value = "";
      filterTurma.value = "";

      atualizarOpcoesEstado(regiao || null);
      atualizarCidades();
      atualizarLista();

      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }

      limparMunicipios();
      ajustarZoom();
    });

    filterEstado.addEventListener("change", () => {
      const est = filterEstado.value;

      if (est) {
        const regiao = stateRegionBySigla[est] || "";
        filterRegiao.value = regiao;
        selectedRegion = regiao || null;
        highlightState = est;
      } else {
        highlightState = null;
        if (!filterRegiao.value) {
          selectedRegion = null;
        }
      }

      highlightCityNorm = null;
      filterCidade.value = "";
      filterTurma.value = "";

      atualizarCidades();
      atualizarLista();

      if (estadosLayer) estadosLayer.setStyle(estadoStyle);
      if (municipiosLayer) municipiosLayer.setStyle(municipioStyle);

      ajustarZoom();
    });

    filterCidade.addEventListener("change", () => {
      atualizarTurmas();
      atualizarLista();
      ajustarZoom();
    });

    filterTurma.addEventListener("change", () => {
      atualizarInstituicoes();
      atualizarLista();
    
    });

    filterPrograma.addEventListener("change", () => {
      atualizarLista();
      // Atualizar estilo dos estados com transiÃ§Ã£o suave
      if (estadosLayer) {
        estadosLayer.setStyle(estadoStyle);
      }
    });

    filterInstituicao.addEventListener("change", () => {
      // Ao mudar instituiÃ§Ã£o, respeita os outros filtros ativos
      atualizarOpcoesEstado(filterRegiao.value || null);
      atualizarCidades();
      atualizarTurmas();
      atualizarLista();
    });

    filterBusca.addEventListener("input", () => {
      atualizarLista();
    });

    btnLimpar.addEventListener("click", limparSelecao);
    mapHomeBtn.addEventListener("click", limparSelecao);

    // -------------------------
    // INICIALIZAÃ‡ÃƒO
    // -------------------------
    document.addEventListener("DOMContentLoaded", () => {
      initMap();
      carregarPaisesVizinhos();
      adicionarProgramasTeachForAll();
      carregarPessoas();
      carregarEstados();
      adicionarLogosMunicipaisIniciais();
      criarLegendaEnsina();
