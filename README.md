# Dialyzer Lab

Prototipo statico, senza dipendenze, per un modello rapido della clearance e l'identificazione dinamica da una risposta al gradino. Versione 0.1.0.

## Aprire e pubblicare

Aprire `docs/index.html` in un browser: funziona anche senza server. Tutti i riferimenti agli asset sono relativi, compatibili con un sito GitHub Pages di progetto. Il codice JavaScript elabora i CSV nel browser; non invia dati a servizi esterni e non usa analytics.

Per pubblicare su GitHub Pages senza una build:

1. Repository: https://github.com/apm1199/dialyzer-lab .
2. I file del sito si trovano nella cartella `docs/` del branch principale.
3. Settings > Pages > Deploy from a branch: scegliere main / docs.

La destinazione selezionata e' l'account apm1199. La pubblicazione e' gestita da GitHub Pages. Le cartelle `tests/` e `.openai/` non sono necessarie nel branch pubblicato.

## Modello statico

Ambito iniziale: HF1000, urea, CVVHD, UF netta nulla; geometria e Qb fissi per dataset.

Per ogni punto si ricava un coefficiente apparente dello scambiatore controcorrente. Con Qmin = min(Qw,Qd), Cr = Qmin/Qmax, NTU = KoA/Qmin:

    K = Qmin * (1 - exp(-NTU*(1-Cr))) / (1 - Cr*exp(-NTU*(1-Cr)))

Per portate uguali: K = Q * KoA/(Q + KoA). La relazione e' usata come descrizione equivalente globale anche in presenza di scambi convettivi interni a UF netta nulla; non risolve tali scambi.

Si interpolano i valori di KoA con Hermite cubica a pendenze PCHIP. La clearance rimane compresa tra zero e min(Qw,Qd). Non si effettua estrapolazione. La ricostruzione ai nodi e' interpolazione, non validazione. La verifica leave-one-out riguarda solo i nodi interni: gli estremi richiederebbero estrapolazione.

### Dati iniziali e provenienza

Fonte: `Paper_APM - draft.pdf`, tabella 4, allegato dall'utente il 2 novembre 2026. I PDF non sono redistribuiti nel sito.

| Qd, mL/min | K acqua, mL/min | K sangue/acqua ematica, mL/min |
|---|---|---|
| 41.67 | 41.00 | 40.47 |
| 66.67 | 62.00 | 58.71 |
| 100.00 | 78.00 | 71.01 |
| 133.33 | 88.00 | 76.53 |

Acqua: 41, 62 e 88 sono target di riferimento commerciali; 78 e' un riferimento di confronto e non una specifica del produttore. Sangue: previsioni CFD, non esperimenti. Qb = 100 mL/min. Sangue: Hct = .35, frazioni acquose plasma .93 ed eritrociti .72, fw = .8565, reologia Carreau-Yasuda.

I valori sperimentali delle figure non sono stati digitalizzati. La tabella E.1 della tesi non e' importata a causa delle discrepanze di bilancio gia' rilevate. I preset separati acqua e sangue non identificano un contributo reologico indipendente: rappresentano l'intera risposta associata a quel fluido.

Concentrazione in ingresso nell'interfaccia: kg/m3 di fluido totale. Per il sangue si usa Cw,in = Cbulk,in/fw e Qw = fw*Qb. Urea equilibrata tra acqua plasmatica ed eritrocitaria. Cd,in = 0.

    rimozione = Kwater * Cw,in
    Cw,out = Cw,in * (1 - Kwater/Qw)
    Cbulk,out = fw * Cw,out
    Cd,out = Kwater * Cw,in/Qd
    Kbulk = Kwater/fw

Il prodotto K in mL/min e C in kg/m3 ha valore numerico in mg/min.

Non e' identificata la sensibilita' a geometria, permeabilita', ematocrito, reologia o Qb fuori dalle condizioni dei dati. Il pannello membrana esegue conversioni separate: k = Lp*mu*delta, Deff = Dbulk*eps/tau. Non modifica la clearance identificata. L'ultima conduttanza A*Deff/delta e' planare e di sola membrana.

### Importazione stazionaria

CSV con intestazione:

    qd_mlmin,clearance_water_mlmin,qb_mlmin,uf_net_mlmin

Le ultime due colonne sono opzionali. Inserire almeno due portate distinte con 0 < K < min(Qw,Qd). Nel pannello dichiarare Qb, fluido e fw. Si presume una sola geometria, soluto e condizione UF=0 per dataset. Eventuali repliche devono essere aggregate prima, conservando separatamente i dati grezzi. Non si applica uno scarto automatico ai dati non ammissibili: l'importazione li segnala.

Supportati CSV con virgola e decimale punto, oppure separatore punto e virgola e decimale virgola. Non supportati campi testuali o quoted multiline. Le misure negative o al limite di saturazione esatto richiedono trattamento specifico prima di invertire KoA; non vengono forzate nel modello.

## Identificazione dinamica

    G(s) = deltaY(s)/deltaU(s) = g*exp(-theta*s)/(tau*s + 1)

Il guadagno g ha unita' output/input, tau e theta sono in secondi. Per Cin -> Cout a portate costanti, il guadagno statico ideale e' un rapporto di concentrazioni; non e' una clearance in mL/min. Per Qd -> Cout la funzione descrive una risposta locale attorno al punto operativo. La concentrazione di un serbatoio ricircolante include anche la dinamica del serbatoio: non identifica da sola il ritardo intrinseco del filtro.

CSV: `time_s,input,output`. Singolo gradino seguito da ingresso costante; almeno 3 campioni precedenti e 10 successivi, almeno 16 complessivi. Tempi strettamente crescenti. Il momento del gradino e' quello del primo campione variato; un ritardo piu' breve del campionamento non e' risolto.

La baseline e' la media pre-gradino. Il primo 70% dei campioni post-gradino e' usato per stimare g, tau e theta mediante ricerca a griglia e regressione dell'ampiezza; la coda e' esclusa dalla stima. Non si calcolano intervalli di confidenza o prove di identificabilita'. Una risposta troppo corta o poco eccitata puo' produrre parametri poco determinati anche con RMSE piccolo. Verificare con una prova indipendente.

La demo e' esplicitamente sintetica (g=.6, tau=30 s, theta=6 s); non e' un risultato sperimentale. Nessun parametro dinamico e' stato identificato dai PDF.

## Test e architettura

    npm test

Non occorre eseguire `npm install`. `docs/model.js` contiene solo funzioni numeriche; `docs/app.js` connette l'interfaccia. I test controllano bilanci, limiti analitici, inversione KoA, riproduzione dei nodi, dominio, CSV, leave-one-out e identificazione di una risposta sintetica. Sono controlli numerici, non validazione sperimentale.

Il porting MATLAB dovra' implementare le stesse funzioni e passare gli stessi casi di riferimento. Il vecchio script `dialyzer_calculator.m` con UF uniforme e' un prototipo separato e non e' il motore di questo sito.

Riferimenti metodologici: Paper_APM - draft.pdf; Michaels, Operating parameters and performance criteria for hemodialyzers and other membrane-separation devices (1966); documentazione MathWorks System Identification, https://www.mathworks.com/help/ident/gs/about-system-identification.html .
