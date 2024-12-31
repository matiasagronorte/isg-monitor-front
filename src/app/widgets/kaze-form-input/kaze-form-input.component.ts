import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR,FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kaze-form-input',
  templateUrl: './kaze-form-input.component.html',
  styleUrls: ['./kaze-form-input.component.css'],
  imports: [CommonModule,FormsModule],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KazeFormInputComponent),
      multi: true,
    },
  ],
})
export class KazeFormInputComponent implements ControlValueAccessor {
  @Input() label!: string;
  @Input() type!: string;
  @Input() formid!: string;
  @Input() name!: string;
  @Input() detail!: string;
  @Input() readonly: boolean = false;
  @Input() focusedParam: boolean = false;

  @Output() kazeOnChange = new EventEmitter<any>();
  @Output() kazeOnKeyUp = new EventEmitter<any>();

  @Input() value: string = '';
  isFocused: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleFocus(): void {
    this.isFocused = true;
  }

  handleBlur(): void {
    this.isFocused = this.value !== '';
    this.onTouched();
  }

  onInput(value: string): void {
    console.log(value)
    this.value = value;
    this.onChange(value);
    this.kazeOnChange.emit(value);
  }

  onKeyUp(event: any): void {
    this.kazeOnKeyUp.emit(event);
  }
}
