import {Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {RangeDaysTooltipDirective} from './directive/range-days-tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, RangeDaysTooltipDirective],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  private readonly DEBUG = true;
  formTravel: FormGroup;
  constructor(private fb: FormBuilder, private renderer: Renderer2) {
    this.formTravel = this.fb.group({
      beginningDate: [null, Validators.required],
      endingDate: [null, Validators.required],
    });
  }

}
