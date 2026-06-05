import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; 

interface LinkedItem {
  title: string;
  price: string;
  imageUrl?: string;
}

interface ChatUser {
  name: string;
  subtitle?: string; // Added to capture 'Computer Science UG' under the user name
  avatarUrl?: string; // If left undefined or empty, fallback initials will display
  linkedItem?: LinkedItem;
}

interface ChatMessage {
  id: string; 
  text: string;
  time: string;
  isMe: boolean;
  file?: {
    name: string;
    url: SafeUrl; 
    isImage: boolean;
    isAudio?: boolean;
    isPlaying?: boolean;
    duration?: number;       
    currentTime?: number;    
    progress?: number;       
  };
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  textComposerPayload: string = '';
  searchQuery: string = '';
  isRecordingVoice: boolean = false;

  // Track the active open unsend action drop-down context by message ID
  activeUnsendDropdownId: string | null = null;

  // Web Audio Context Recording Pipeline
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private leftAudioBuffers: Float32Array[] = [];
  private totalBufferLength: number = 0;
  private localStreamReference: MediaStream | null = null;

  recordingDuration: number = 0;
  private durationInterval: any;

  activeChannelUser: ChatUser = {
    name: 'Rohit Sharma',
    subtitle: 'Computer Science UG', // Integrated layout description configuration field
    // avatarUrl: 'assets/rohit.png', // Uncommenting this will automatically use the image instead
    linkedItem: {
      title: 'iPhone 16',
      price: '₹69,900'
    }
  };

  chatLogs: ChatMessage[] = [];

  contextualChips: string[] = [
    'Hello!',
    'Is it available?',
    'Can you share more details?',
    'When did you buy this?',
    'What is the condition of the product?',
    'Request for call'
  ];

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  /**
   * Safe helper that extracts the first initial of the user's name
   */
  getUserInitial(name: string): string {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  }

  onDashboardAction(viewName: string): void {
    alert(`Navigating to your ${viewName} panel...`);
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  _dispatchMessage(): void {
    if (this.isRecordingVoice) {
      this.stopAudioRecording();
      return;
    }

    if (!this.textComposerPayload.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.chatLogs.push({
      id: this.generateMessageId(),
      text: this.textComposerPayload,
      time: currentTime,
      isMe: true
    });

    this.textComposerPayload = '';
    this.scrollToBottom();
  }

  private sendAudioMessage(audioUrl: SafeUrl, recordedDurationSeconds: number): void {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    this.chatLogs.push({
      id: this.generateMessageId(),
      text: '',
      time: currentTime,
      isMe: true,
      file: {
        name: 'Voice Note',
        url: audioUrl,
        isImage: false,
        isAudio: true,
        isPlaying: false,
        duration: recordedDurationSeconds > 0 ? recordedDurationSeconds : 0, 
        currentTime: 0,
        progress: 0
      }
    });
    
    this.scrollToBottom();
    this.cdr.detectChanges(); 
  }

  unsendMessage(targetMessage: ChatMessage): void {
    this.chatLogs = this.chatLogs.filter(msg => msg.id !== targetMessage.id);
    this.cdr.detectChanges();
  }

  injectChipValue(chipValue: string): void {
    this.textComposerPayload = chipValue;
    this._dispatchMessage();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      Array.from(fileList).forEach(file => {
        const rawUrl = URL.createObjectURL(file);
        const safeFileUrl = this.sanitizer.bypassSecurityTrustUrl(rawUrl);
        const isImageFile = file.type.startsWith('image/');

        this.chatLogs.push({
          id: this.generateMessageId(),
          text: isImageFile ? '' : `Sent an attachment: ${file.name}`,
          time: currentTime,
          isMe: true,
          file: {
            name: file.name,
            url: safeFileUrl,
            isImage: isImageFile,
            isAudio: false
          }
        });
      });

      this.scrollToBottom();
      element.value = '';
    }
  }

  toggleVoiceDictation(): void {
    if (this.isRecordingVoice) {
      this.stopAudioRecording();
    } else {
      this.startAudioRecording();
    }
  }

  private startAudioRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.localStreamReference = stream;
        this.leftAudioBuffers = [];
        this.totalBufferLength = 0;
        this.recordingDuration = 0;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.scriptProcessor.onaudioprocess = (e) => {
          if (!this.isRecordingVoice) return;
          const inputData = e.inputBuffer.getChannelData(0);
          this.leftAudioBuffers.push(new Float32Array(inputData));
          this.totalBufferLength += inputData.length;
        };

        this.mediaStreamSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);

        this.isRecordingVoice = true;

        this.durationInterval = setInterval(() => {
          this.recordingDuration++;
          this.cdr.detectChanges(); 
        }, 1000);
      })
      .catch(error => {
        console.error('Microphone access denied:', error);
        alert('Could not access microphone.');
      });
  }

  private stopAudioRecording(): void {
    if (!this.isRecordingVoice) return;
    this.isRecordingVoice = false;

    clearInterval(this.durationInterval);

    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
    if (this.localStreamReference) {
      this.localStreamReference.getTracks().forEach(track => track.stop());
    }

    const sampleRate = this.audioContext ? this.audioContext.sampleRate : 44100;
    if (this.audioContext) this.audioContext.close();

    const flattenedBuffer = new Float32Array(this.totalBufferLength);
    let offset = 0;
    for (let i = 0; i < this.leftAudioBuffers.length; i++) {
      flattenedBuffer.set(this.leftAudioBuffers[i], offset);
      offset += this.leftAudioBuffers[i].length;
    }

    const wavBuffer = this.encodeWAV(flattenedBuffer, sampleRate);
    const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const rawAudioUrl = URL.createObjectURL(audioBlob);
    
    const safeAudioUrl = this.sanitizer.bypassSecurityTrustUrl(rawAudioUrl);
    this.sendAudioMessage(safeAudioUrl, this.recordingDuration);
  }

  discardAudioRecording(): void {
    if (!this.isRecordingVoice) return;
    this.isRecordingVoice = false;

    clearInterval(this.durationInterval);

    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
    if (this.localStreamReference) {
      this.localStreamReference.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) this.audioContext.close();

    this.leftAudioBuffers = [];
    this.totalBufferLength = 0;
    this.recordingDuration = 0;
    
    this.cdr.detectChanges();
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  getFormattedDuration(): string {
    const minutes = Math.floor(this.recordingDuration / 60);
    const seconds = this.recordingDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  initAudioDuration(fileObj: any, nativeAudio: HTMLAudioElement): void {
    if (nativeAudio.duration && isFinite(nativeAudio.duration) && (!fileObj.duration || fileObj.duration === 0)) {
      fileObj.duration = Math.round(nativeAudio.duration);
      this.cdr.detectChanges();
    }
  }

  togglePlayback(fileObj: any, nativeAudio: HTMLAudioElement): void {
    if (fileObj.isPlaying) {
      nativeAudio.pause();
      fileObj.isPlaying = false;
    } else {
      nativeAudio.play();
      fileObj.isPlaying = true;
    }
    this.cdr.detectChanges();
  }

  onAudioTimeUpdate(fileObj: any, nativeAudio: HTMLAudioElement): void {
    fileObj.currentTime = nativeAudio.currentTime;
    
    if (nativeAudio.duration && isFinite(nativeAudio.duration) && (!fileObj.duration || fileObj.duration === 0)) {
      fileObj.duration = nativeAudio.duration;
    }

    if (fileObj.duration && fileObj.duration > 0) {
      fileObj.progress = (nativeAudio.currentTime / fileObj.duration) * 100;
    } else {
      fileObj.progress = 0;
    }
    this.cdr.detectChanges();
  }

  onAudioTrackEnded(fileObj: any): void {
    fileObj.isPlaying = false;
    fileObj.currentTime = 0;
    fileObj.progress = 0;
    this.cdr.detectChanges();
  }

  getAudioCountdownDisplay(fileObj: any): string {
    const total = fileObj.duration || 0;
    const current = fileObj.currentTime || 0;
    const remainingTime = Math.max(0, Math.ceil(total - current));
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onSearchChange(): void {
    console.log('Search text updated:', this.searchQuery);
  }

  viewProductDetail(item: LinkedItem | undefined): void {
    if (item) {
      alert(`Opening product view details for: ${item.title}`);
    }
  }

  onLogout(): void {
    alert('Logging out of your active session...');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatScrollContainer = document.querySelector('.overflow-y-auto');
      if (chatScrollContainer) {
        chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
      }
    }, 50);
  }
}