# Programska podrška za planiranje i provođenje kibernetičkih napada

Programska podrška za planiranje i provođenje kibernetičkih vježbi koja za planiranje scenarija kibernetičke vježbe koristi 
algoritam planiranja parcijalnog poretka, a za prikaz scenarija na korisničkom sučelju i za praćenje provođenja scenarija 
koristi alat za upravljanje projektima, gantogram.

## Pokretanje programske podrške

### Preduvjeti

Za pokretanje projekta na računalu mora biti instaliran Docker koji se brine o svim ovisnostima aplikacije.

### Pokretanje

Programska podrška pokreće se pozicioniranjem u korijenski direktorij projekta i izvođenjem naredbe:
```
docker-compose up
```

## Primjer korištenja
Cilj kibernetičke vježbe planirane ovim primjerom jest u intervalu od prvog lipnja 2020. godine do prvog srpnja 2020. godine ostvariti 
onesposobljavanje vodovodnog sustava i širenje lažnih vijesti. Prvo se dodaje zadatak koji modelira početno stanje na način da se kao 
akcija izabere _Initial state_. Potom se dodaje zadatak koji modelira ciljno stanje tako da se odabere akcija _Goal state_, 
a preduvjeti postave na vrijednosti krajnjih ciljeva, u ovom primjeru _disable_water = True; spread_fake_news = True_. 
Zadatak koji predstavlja ciljno stanje prikazan je na sljedećoj slici:

![alt text](https://github.com/kdjmaja/diplomski/blob/master/images/goal.png?raw=true)

Nakon modeliranja početnog i ciljnog stanja okida se planiranje scenarija pritiskom na gumb _Calculate plan}_. Rezultat planiranja scenarija 
kibernetičke vježbe prikazan je idućom slikom:

![alt text](https://github.com/kdjmaja/diplomski/blob/master/images/first-plan.png?raw=true)

Za potrebe primjera određeno je da akcija _Send targeted malicious emails_ nije uspješno izvršena prilikom provođenja vježbe stoga se pripadni 
zadatak označava kao neuspješan, što je prikazano na sljedećoj slici:

![alt text](https://github.com/kdjmaja/diplomski/blob/master/images/failed-task.png?raw=true)

Spremanjem navedene promjene okida se rekalkulacija scenarija kibernetičke vježbe od neuspješno izvedenog zadatka do ciljnog zadatka. 
Rekalkulirani plan prikazan je idućom slikom gdje je vidljivo kako je neuspješna akcija označena crvenom bojom, a plan nakon nje rekalkuliran.

![alt text](https://github.com/kdjmaja/diplomski/blob/master/images/recalc-plan.png?raw=true)
