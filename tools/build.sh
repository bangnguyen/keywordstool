echo "hello"

cd /root/keywordstool
git pull origin master
/root/framework/activator-1.2.12/activator clean dist
rm -rf keywordstool-2.0-SNAPSHOT.zip
unzip target/universal/keywordstool-2.0-SNAPSHOT.zip
for KILLPID in `ps ax | grep keywordstool | awk ' { print $1;}'`; do
echo $KILLPID
kill -9 $KILLPID || {
  echo "not found "  $KILLPID;
}
done
./keywordstool-2.0-SNAPSHOT/bin/keywordstool -Dhttp.port=80 -J-Xmx1500m -J-Xms1500m
