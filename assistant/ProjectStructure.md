## Tool Required
- skills
- projects
- education
- certifications
- timeline
- experiences
- fetch page (home)
- social links
- site settings
- ai knowledge 
- blogs (Get Single Blogs)

## After getting the data from these tools convert the required data into text or md do not provide these full data which will increase the model cost. 

Strapi calls -> /train with the same secret 

**Database Tables** 

***Knowledge***
id -> uid
source_type -> Blob/resume/custom/faq
source_id -> documentid
chunk_index -> ordering within the document
content -> text (chunk text)
content_hash -> hash (to skip the re-embedding the chunks)
embedding -> vector
dim -> embedding dim
embedding_model -> model produced it
updated_at -> datetime
created_at -> datetime

***Training*** : Table to know whether model is being trained to avoid answering the question of the model whenever asked in production. 
id -> int (serial)
start_date_time -> datetime
end_date_time -> datetime

**Note**: Operations on each row must be perform by the Thread pool executor. 

Strapi calls -> /train endpoint ->(Add record in Training table) which will stop the model from giving the responses -> Work in Background ->
Load the AIKnowledge -> Get the existing source -> Determine which are missing -> Perform operation on each row ->
if source_type is PDF
    -> Load the Pdf
    -> Extract or split the pdf and load the data
    -> Chunk
    -> Compute Hash
    -> Compare against the stored hash in the table if matches then skip if not matches then check the chunk (chunk_index and source_id) -> for that chunk update -> if that chunk also not found then new entry
    -> embed using embedding model 
    -> Update that row with new hash
    -> For chunks which went missing when training delete that row
if source if Markdown
    -> same process just chunk with the Headings
-> After coompleting need to delete chunks which are not found in the AIKnowledge. 
-> Then Delete missing sources
-> Add the record in the Training that it is completed and ready to use. 



    



