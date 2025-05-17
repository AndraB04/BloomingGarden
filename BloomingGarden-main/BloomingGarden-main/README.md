# Proiect Colective - TechTastic - Angular & Java

Acest repository conține două proiecte separate: o aplicație backend dezvoltată în Java SpringBoot și o aplicație frontend dezvoltată în Angular. Vă rugăm să urmați instrucțiunile de mai jos pentru a configura și rula fiecare proiect în ordinea specificată.

## Instrucțiuni de Setup

### 1. Java SpringBoot

Acest proiect reprezintă componenta backend a aplicației.

**Precondiții:**

* **Java 21:** Asigurați-vă că aveți instalată versiunea 21 a Java. Puteți verifica versiunea instalată rulând comanda `java -version` în terminal.
* **Maven:** Asigurați-vă că Maven este instalat și configurat corect. Puteți verifica instalarea rulând comanda `mvn -v` în terminal.
* **IntelliJ Ultimate:** Se recomandă utilizarea IntelliJ Ultimate pentru dezvoltare.
* **MySQL Workbench:** Trebuie să aveți instalat MySQL Workbench sau un alt client similar pentru gestionarea bazei de date MySQL.
* **Server MySQL activ:** Asigurați-vă că serverul dumneavoastră MySQL este pornit și rulează.

**Pași de Setup:**

1.  **Deschideți proiectul:** După descărcarea repository-ului, deschideți folderul `java_shop` în IntelliJ Ultimate.
2.  **Verificați baza de date:** Asigurați-vă că în MySQL Workbench există o bază de date cu numele `shop_db`. Dacă nu există, va trebui să o creați.
3.  **Configurați conexiunea la baza de date:** Deschideți fișierul `application.properties` situat în folderul proiectului Java (de obicei în `src/main/resources/`). Modificați următoarele proprietăți cu datele dumneavoastră de conectare la serverul MySQL:

    ```properties
    spring.datasource.username=[datele voastre de la mysql server]
    spring.datasource.password=[datele voastre de la mysql server]
    ```

4.  **Rulați aplicația:** Puteți rula aplicația Java SpringBoot direct din IntelliJ Ultimate folosind butonul "Run".

### 2. Angular

Acest proiect reprezintă componenta frontend a aplicației.

**Precondiții:**

* **Node.js:** Asigurați-vă că Node.js este instalat pe sistemul dumneavoastră. Puteți descărca și instala de pe [https://nodejs.org/en/download](https://nodejs.org/en/download). Verificați instalarea rulând `node -v` și `npm -v` în terminal.
* **Angular CLI:** Asigurați-vă că Angular CLI (Command Line Interface) este instalat global. Dacă nu este instalat, puteți face acest lucru rulând comanda:

    ```bash
    npm install -g @angular/cli
    ```

    Puteți verifica instalarea rulând comanda `ng version` în terminal.
* **IntelliJ Ultimate:** Se recomandă utilizarea IntelliJ Ultimate pentru dezvoltare.

**Pași de Setup:**

1.  **Deschideți proiectul:** După descărcarea repository-ului, deschideți folderul `angular_shop` în IntelliJ Ultimate.
2.  **Instalați dependențele:** Deschideți terminalul din IntelliJ Ultimate (de obicei accesibil prin `Alt + F12` sau `View` -> `Tool Windows` -> `Terminal`) și rulați următoarea comandă pentru a instala toate pachetele necesare proiectului Angular:

    ```bash
    npm install
    ```

3.  **Rulați aplicația:** Puteți rula aplicația Angular în două moduri:
    * **Din IntelliJ Ultimate:** Puteți utiliza butonul "Run" din IntelliJ (s-ar putea să fie necesar să configurați o configurație de rulare pentru `npm start` sau `ng serve`).
    * **Din terminal:** Deschideți terminalul în folderul `angular_shop` și rulați comanda:

        ```bash
        ng serve
        ```

4.  **Accesați aplicația în browser:** După ce aplicația Angular a fost compilată și pornit cu succes, deschideți browserul dumneavoastră web și accesați următorul link:

    ```
    http://localhost:4200
    ```

Vă mulțumim pentru utilizarea proiectului TechTastic!