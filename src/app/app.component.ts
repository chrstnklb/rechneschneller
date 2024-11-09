import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list'; // <-- Added import
import { MatProgressBarModule } from '@angular/material/progress-bar';



import confetti from 'canvas-confetti'; // <-- Added import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatGridListModule, // <-- Added MatGridListModule
    MatProgressBarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'rechneschneller';
  readonly NUMBER_OF_ROUNDS = 10; // Define the constant for the number of rounds
  dividend!: number;
  divisor!: number;
  correctAnswer!: number;
  options: number[] = [];
  fehler: number = 0;
  taskCount: number = 0;
  backgroundColor: string = '';
  currentRound: number = 1;
  startTime: number;
  endTime!: number;
  timeTaken!: number;
  highScores: any[] = [];
  displayedColumns: string[] = ['date', 'timeTaken', 'fehler'];
  showMessage: boolean = false;

  constructor() {
    this.startTime = Date.now();
    this.loadHighScores();
    this.generateDivision();
  }

  generateDivision(): void {
    do {
      this.divisor = Math.floor(Math.random() * 21);
    } while (this.divisor <= 1); // Avoid 0 and 1 as divisors

    do {
      this.dividend = this.divisor * Math.floor(Math.random() * 11);
    } while (this.dividend <= 1); // Avoid 0 and 1 as dividends

    this.correctAnswer = this.dividend / this.divisor;
    this.generateOptions();
    this.resetOptionCards(); // Reset the background color of the option cards
  }

  resetOptionCards(): void {
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
      card.classList.remove('correct', 'incorrect');
    });
  }

  generateOptions(): void {
    this.options = [];
    const correctIndex = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        this.options.push(this.correctAnswer);
      } else {
        let wrongAnswer;
        do {
          wrongAnswer = Math.floor(Math.random() * 21);
        } while (wrongAnswer === this.correctAnswer || this.options.includes(wrongAnswer));
        this.options.push(wrongAnswer);
      }
    }
  }

  checkAnswer(selectedOption: number): void {
    if (selectedOption === this.correctAnswer) {
      this.backgroundColor = 'green';
      setTimeout(() => {
        this.backgroundColor = '';
        this.taskCount++;
        this.currentRound++; // Increment the current round
        if (this.taskCount < this.NUMBER_OF_ROUNDS) {
          this.generateDivision();
        } else {
          this.endTime = Date.now();
          this.timeTaken = (this.endTime - this.startTime) / 1000; // Time in seconds
          this.saveResult();
          if (this.fehler === 0) {
            this.throwConfetti(); // <-- Added confetti trigger
            this.showSuccessMessage(); // <-- Added message trigger
          }
        }
      }, 500);
    } else {
      this.backgroundColor = 'red';
      this.fehler++;
      setTimeout(() => {
        this.backgroundColor = '';
      }, 500);
    }
  }

  // Add the `throwConfetti` method:
  throwConfetti(): void {
    confetti({
      particleCount: 1000,
      spread: 100,
      origin: { y: 0.6 }
    });
  }

  // Add the `showSuccessMessage` method:
  showSuccessMessage(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 5000); // Message disappears after 2 seconds
  }

  saveResult(): void {
    const result = {
      timeTaken: this.timeTaken,
      fehler: this.fehler,
      date: new Date().toLocaleString(),
      isCurrent: true
    };
    this.highScores.forEach(score => score.isCurrent = false); // Reset previous highlights
    this.highScores.push(result);
    this.highScores.sort((a, b) => a.timeTaken - b.timeTaken); // Sort by time taken
    localStorage.setItem('highScores', JSON.stringify(this.highScores));
  }

  loadHighScores(): void {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
      this.highScores = JSON.parse(savedScores);
    }
  }

  startNewRound(): void {
    this.fehler = 0;
    this.taskCount = 0;
    this.backgroundColor = '';
    this.currentRound = 1;
    this.startTime = Date.now();
    this.generateDivision();
  }

}