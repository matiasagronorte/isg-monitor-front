import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR,FormsModule, NgControl } from '@angular/forms';

@Component({
  selector: 'app-kaze-form-select',
  templateUrl: './kaze-form-select.component.html',
  styleUrls: ['./kaze-form-select.component.css'],
  imports: [CommonModule,FormsModule],
  standalone: true,
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => KazeFormSelectComponent),
  //     multi: true,
  //   },
  // ],
})

export class KazeFormSelectComponent {

  @Input() label!: string;
  @Input() type!: string;
  @Input() formid!: string;
  @Input() name!: string;
  @Input() detail!: string;
  @Input() readonly: boolean = false;
  @Input() focusedParam: boolean = false;
  @Input() firstoption: string = ""

  @Input() options!: any[];

  @Output() kazeOnChange = new EventEmitter<any>();
  @Output() kazeOnKeyUp = new EventEmitter<any>();

  @Output() optionSelected = new EventEmitter<string>();

  @Input() value: string = '';
  isFocused: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  selectedOption = ""

  // constructor(){
  //   this.selectedOption = {
  //     value: '',
  //     text: ''
  //   }
  // }

  constructor( public ngControl: NgControl) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

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

  onSelect(event: Event): void {
    this.selectedOption = (event.target as HTMLSelectElement).value;
    this.optionSelected.emit(this.selectedOption);
    
    this.value = this.selectedOption;
    this.onChange(this.selectedOption);
    this.kazeOnChange.emit(this.selectedOption);
  }

  identify = (index: number, item: any) => item;

}
