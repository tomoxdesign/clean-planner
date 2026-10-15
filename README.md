# Plánovač úklidu

Stránka pro GitHub Pages: kalendář úklidu po místnostech, uživatelé, opakované úkoly a historie hotových úkolů.
Data se sdílejí přes Google Tabulku a Apps Script.

## 1. Google Tabulka (sdílená data)

1. Na [sheets.new](https://sheets.new) vytvoř novou tabulku, třeba „Úklid – data“.
2. V menu zvol **Rozšíření → Apps Script**.
3. Smaž obsah `Code.gs`, vlož celý soubor [`apps-script/Code.gs`](apps-script/Code.gs) a ulož (Ctrl+S).
4. Vpravo nahoře klikni na **Nasadit → Nové nasazení**:
   - Typ (ozubené kolečko): **Webová aplikace**
   - Spustit jako: **Já**
   - Kdo má přístup: **Kdokoli**
5. Klikni na **Nasadit** a povol přístup ke svému účtu. Google může zobrazit varování „aplikace není ověřená“: zvol *Rozšířené → Přejít na … (nebezpečné)*. Je to tvůj vlastní skript.
6. Zkopíruj **adresu webové aplikace**. Končí na `/exec`.

## 2. GitHub Pages

1. Nahraj `index.html` do repozitáře na GitHubu. Složka `apps-script` tam být nemusí.
2. V **Settings → Pages** nastav Source na *Deploy from a branch*, branch `main` a složku `/ (root)`.
3. Otevři stránku, v **Nastavení → Sdílení dat** vlož adresu `/exec` a klikni na **Připojit**.
4. Klikni na **Zkopírovat odkaz pro ostatní** a pošli ho rodině. Kdo ho otevře, připojí se automaticky.


Adresu můžeš také rovnou vepsat do `index.html` do konstanty `DEFAULT_SYNC_URL`. Pak se připojí každý, kdo stránku otevře.

## Jak to funguje

- Data jsou v tabulce na listu `data` jako JSON. List `Přehled` obsahuje čitelnou tabulku úkolů a jen se do něj zapisuje. Ručně ho needituj, při další změně se přepíše.
- Změny se odesílají hned. Změny ostatních se načítají každých 20 s a také při návratu do záložky. Ikona mráčku nahoře ukazuje stav a kliknutím vynutíš načtení.
- Když dva lidé změní něco současně, změny se sloučí po jednotlivých úkolech. Když oba změní stejný úkol, platí změna toho, kdo uložil později.
- Bez internetu aplikace dál funguje a změny odešle, jakmile je zase připojení.

## Úprava skriptu

Když změníš `Code.gs`, zvol **Nasadit → Spravovat nasazení → upravit (tužka) → Verze: Nová verze**. Adresa `/exec` zůstane stejná.

## Bezpečnost

Kdo zná adresu `/exec`, může data číst i měnit. Neposílej ji veřejně. Pro rodinný plánovač to obvykle stačí.


