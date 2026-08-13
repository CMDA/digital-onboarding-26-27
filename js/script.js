const questionContainerSelector = '[data-checklist-question], .question-block, .card';
const helpBlockSelector = '[data-role="help"], .help, #help-block';
const completeBlockSelector = '[data-role="complete"], .complete, #complete-block';
const followUpSelector = '[data-role="followup"], .follow-up';
const answerButtonSelector =
  '[data-choice="yes"], [data-choice="no"], [data-answer="yes"], [data-answer="no"], .yes-btn, .no-btn, #yes-btn, #no-btn';

const showElement = (element) => {
  if (element) {
    element.style.display = 'block';
  }
};

const hideElement = (element) => {
  if (element) {
    element.style.display = 'none';
  }
};

const getQuestionContainer = (button) => {
  return button.closest(questionContainerSelector);
};

const getQuestionContainers = () => {
  return [...document.querySelectorAll(questionContainerSelector)].filter((container) => {
    return container.querySelector(answerButtonSelector);
  });
};

const resetQuestionContainer = (container) => {
  const helpBlock = container.querySelector(helpBlockSelector);
  const completeBlock = container.querySelector(completeBlockSelector);

  hideElement(helpBlock);
  hideElement(completeBlock);
  hideFollowUps(container);

  container.querySelectorAll(answerButtonSelector).forEach((choice) => {
    choice.classList.remove('is-selected');
    choice.setAttribute('aria-pressed', 'false');
  });
};

const hideQuestionsAfter = (container, reset = false) => {
  const questions = getQuestionContainers();
  const index = questions.indexOf(container);

  if (index === -1 || questions.length <= 1) {
    return;
  }

  for (let i = index + 1; i < questions.length; i += 1) {
    hideElement(questions[i]);
    if (reset) {
      resetQuestionContainer(questions[i]);
    }
  }
};

const showNextQuestion = (container) => {
  const questions = getQuestionContainers();
  const index = questions.indexOf(container);

  if (index === -1 || questions.length <= 1 || index === questions.length - 1) {
    return;
  }

  showElement(questions[index + 1]);
};

const setSelectedAnswer = (button) => {
  const choiceGroup = button.closest('.choices');

  if (choiceGroup) {
    choiceGroup.querySelectorAll('button, .btn-choice').forEach((choice) => {
      choice.classList.remove('is-selected');
      choice.setAttribute('aria-pressed', 'false');
    });

    button.classList.add('is-selected');
    button.setAttribute('aria-pressed', 'true');
    return;
  }

  const container = getQuestionContainer(button);
  if (!container) {
    return;
  }

  container.querySelectorAll(answerButtonSelector).forEach((choice) => {
    choice.classList.remove('is-selected');
    choice.setAttribute('aria-pressed', 'false');
  });

  button.classList.add('is-selected');
  button.setAttribute('aria-pressed', 'true');
};

const hideFollowUps = (container) => {
  const followUps = container.querySelectorAll(followUpSelector);
  followUps.forEach((followUp) => {
    hideElement(followUp);
  });
};

const showFollowUp = (button) => {
  const followUpId = button.getAttribute('data-target-followup');
  const container = getQuestionContainer(button);

  if (!container) {
    return;
  }

  if (followUpId) {
    const target = container.querySelector(`#${followUpId}`);
    showElement(target);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  const firstFollowUp = container.querySelector(followUpSelector);
  showElement(firstFollowUp);
  if (firstFollowUp) {
    firstFollowUp.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const setQuestionState = (container, state) => {
  const helpBlock = container.querySelector(helpBlockSelector);
  const completeBlock = container.querySelector(completeBlockSelector);

  if (!helpBlock && !completeBlock) {
    return;
  }

  if (state === 'done') {
    hideElement(helpBlock);
    showElement(completeBlock);
    hideFollowUps(container);
    if (completeBlock) {
      completeBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  if (state === 'needs-help') {
    showElement(helpBlock);
    hideElement(completeBlock);
    if (helpBlock) {
      helpBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

// Event delegation allows any number of question blocks on one page.
document.addEventListener('click', (event) => {
  const doneButton = event.target.closest(
    '[data-choice="yes"], [data-answer="yes"], .yes-btn, #yes-btn'
  );
  const helpButton = event.target.closest(
    '[data-choice="no"], [data-answer="no"], .no-btn, #no-btn'
  );


  if (doneButton) {
    setSelectedAnswer(doneButton);
    const container = getQuestionContainer(doneButton);
    if (container) {
      setQuestionState(container, 'done');
      showNextQuestion(container);
    }
    return;
  }

  if (helpButton) {
    setSelectedAnswer(helpButton);
    const container = getQuestionContainer(helpButton);
    if (container) {
      setQuestionState(container, 'needs-help');
      hideQuestionsAfter(container, true);
    }
    return;
  }

  const closeFollowUpButton = event.target.closest('[data-action="complete-followup"]');

  if (closeFollowUpButton) {
    const container = getQuestionContainer(closeFollowUpButton);
    if (container) {
      hideFollowUps(container);
    }
    return;
  }

  const showFollowUpButton = event.target.closest('[data-action="show-followup"]');

  if (showFollowUpButton) {
    showFollowUp(showFollowUpButton);
  }
});

// Follow-up blocks start hidden and are opened when requested by the user.
document.querySelectorAll(questionContainerSelector).forEach((container) => {
  hideFollowUps(container);

  container.querySelectorAll(answerButtonSelector).forEach((choice) => {
    choice.classList.remove('is-selected');
    choice.setAttribute('aria-pressed', 'false');
  });
});

const questionContainers = getQuestionContainers();

if (questionContainers.length > 1) {
  questionContainers.forEach((container, index) => {
    if (index === 0) {
      showElement(container);
      resetQuestionContainer(container);
      return;
    }

    hideElement(container);
    resetQuestionContainer(container);
  });
}

const confettiButtons = document.querySelectorAll('.trigger-confetti');

confettiButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const targetHref = button.getAttribute('href');

    if (targetHref) {
      event.preventDefault();
    }

    const end = Date.now() + 900;
    const colors = ['#b9d00b', '#d8f310', '#e6bf6c'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 45,
        origin: { x: 0, y: 1 },
        colors
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 45,
        origin: { x: 1, y: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    if (targetHref) {
      setTimeout(() => {
        window.location.href = targetHref;
      }, 1200);
    }
  });
});
