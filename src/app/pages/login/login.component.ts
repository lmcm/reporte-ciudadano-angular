import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';

  onSubmit() {
    console.log('Login attempt:', { email: this.email, password: this.password });
  }
}