const getQuestions = 'select * from qa.questions where product_id = $1 group by questions.id order by sum(helpful) desc;';

const getQuestionIdAnswers = 'select * from qa.answers where question_id = $1 group by answers.id order by sum(helpful) desc;';

const getPhotos = 'select * from qa.photos inner join qa.answers on (qa.answers.id = qa.photos.answer_id';

const postQuestion = '';

const putQuestionHelpful = '';


const putQuestionReport = '';


const putAnswerHelpful = '';


const putAnswerReport = '';


module.exports = {
  getQuestions,
  getQuestionIdAnswers,
  postQuestion,
  putQuestionHelpful,
  putQuestionReport,
  putAnswerHelpful,
  putAnswerReport
}