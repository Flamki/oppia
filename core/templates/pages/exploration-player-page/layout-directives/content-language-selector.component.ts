// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Component for the content language selector displayed when
 * playing an exploration.
 */

import { Component, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ContentTranslationLanguageService } from
  'pages/exploration-player-page/services/content-translation-language.service';
import { ContextService } from 'services/context.service';
import { ExplorationLanguageInfo } from
  'pages/exploration-player-page/services/audio-translation-language.service';
import { PlayerPositionService } from
  'pages/exploration-player-page/services/player-position.service';
import { PlayerTranscriptService } from
  'pages/exploration-player-page/services/player-transcript.service';
import { SwitchContentLanguageRefreshRequiredModalComponent } from
  // eslint-disable-next-line max-len
  'pages/exploration-player-page/switch-content-language-refresh-required-modal.component';
import { ImagePreloaderService } from 'pages/exploration-player-page/services/image-preloader.service';
import { I18nLanguageCodeService } from 'services/i18n-language-code.service';
import { WindowRef } from 'services/contextual/window-ref.service';

@Component({
  selector: 'oppia-content-language-selector',
  templateUrl: './content-language-selector.component.html',
  styleUrls: []
})
export class ContentLanguageSelectorComponent implements OnInit {
  constructor(
    private contentTranslationLanguageService:
      ContentTranslationLanguageService,
    private contextService: ContextService,
    private playerPositionService: PlayerPositionService,
    private playerTranscriptService: PlayerTranscriptService,
    private ngbModal: NgbModal,
    private imagePreloaderService: ImagePreloaderService,
    private i18nLanguageCodeService: I18nLanguageCodeService,
    private windowRef: WindowRef
  ) { }

  // These properties are initialized using Angular lifecycle hooks
  // and we need to do non-null assertion. For more information, see
  // https://github.com/oppia/oppia/wiki/Guide-on-defining-types#ts-7-1
  selectedLanguageCode!: string;
  languageOptions!: ExplorationLanguageInfo[];
  currentGlobalLanguageCode!: string;
  newLanguageCode!: string;

  ngOnInit(): void {
    const url = new URL(this.windowRef.nativeWindow.location.href);
    this.currentGlobalLanguageCode = (
      this.i18nLanguageCodeService.getCurrentI18nLanguageCode());
    this.selectedLanguageCode = (
      this.contentTranslationLanguageService.getCurrentContentLanguageCode());
    this.languageOptions = (
      this.contentTranslationLanguageService.getLanguageOptionsForDropdown());
    this.newLanguageCode = (
      url.searchParams.get('initialContentLanguageCode') ||
      this.currentGlobalLanguageCode);
    for (let option of this.languageOptions) {
      if (option.value === this.newLanguageCode) {
        this.contentTranslationLanguageService.setCurrentContentLanguageCode(
          option.value);
        this.selectedLanguageCode = (
          this.contentTranslationLanguageService.getCurrentContentLanguageCode()
        );
        break;
      }
    }
  }

  onSelectLanguage(newLanguageCode: string): string {
    if (this.shouldPromptForRefresh()) {
      const modalRef = this.ngbModal.open(
        SwitchContentLanguageRefreshRequiredModalComponent);
      modalRef.componentInstance.languageCode = newLanguageCode;
    } else {
      this.contentTranslationLanguageService.setCurrentContentLanguageCode(
        newLanguageCode);
      this.selectedLanguageCode = newLanguageCode;
    }

    // Image preloading is disabled in the exploration editor preview mode.
    if (!this.contextService.isInExplorationEditorPage()) {
      this.imagePreloaderService.restartImagePreloader(
        this.playerTranscriptService.getCard(0).getStateName());
    }

    return this.selectedLanguageCode;
  }

  shouldDisplaySelector(): boolean {
    return (
      this.languageOptions.length > 1 &&
      this.playerPositionService.displayedCardIndex === 0);
  }

  private shouldPromptForRefresh(): boolean {
    const firstCard = this.playerTranscriptService.getCard(0);
    return firstCard.getInputResponsePairs().length > 0;
  }
}

angular.module('oppia').directive(
  'oppiaContentLanguageSelector',
  downgradeComponent({ component: ContentLanguageSelectorComponent }));
